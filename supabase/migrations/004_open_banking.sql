-- transactions: imported bank transactions, manually categorised
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  external_id   text,            -- dedup key: date|amount|description hash
  import_source text,            -- original filename
  amount        numeric not null,
  currency      text not null default 'EUR',
  description   text not null default '',
  date          date not null,
  category      text,
  created_at    timestamptz default now()
);

-- Partial unique index: deduplicate only when external_id is set
create unique index if not exists transactions_user_external_id
  on public.transactions (user_id, external_id)
  where external_id is not null;

alter table public.transactions enable row level security;

drop policy if exists "Users can read own transactions"   on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

create policy "Users can read own transactions"   on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);
