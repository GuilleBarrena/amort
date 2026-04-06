-- bank_connections: one row per GoCardless requisition (linked bank account set)
create table if not exists public.bank_connections (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  requisition_id   text not null,
  institution_id   text not null,
  institution_name text not null,
  status           text not null default 'pending',
  account_ids      text[] default '{}',
  created_at       timestamptz default now(),
  last_synced_at   timestamptz,
  unique(user_id, requisition_id)
);

alter table public.bank_connections enable row level security;

drop policy if exists "Users can read own connections"   on public.bank_connections;
drop policy if exists "Users can insert own connections" on public.bank_connections;
drop policy if exists "Users can update own connections" on public.bank_connections;
drop policy if exists "Users can delete own connections" on public.bank_connections;

create policy "Users can read own connections"   on public.bank_connections for select using (auth.uid() = user_id);
create policy "Users can insert own connections" on public.bank_connections for insert with check (auth.uid() = user_id);
create policy "Users can update own connections" on public.bank_connections for update using (auth.uid() = user_id);
create policy "Users can delete own connections" on public.bank_connections for delete using (auth.uid() = user_id);

-- transactions: imported bank transactions, manually categorised
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  connection_id uuid not null references public.bank_connections(id) on delete cascade,
  external_id   text not null,
  account_id    text not null,
  amount        numeric not null,
  currency      text not null default 'EUR',
  description   text not null default '',
  date          date not null,
  category      text,
  created_at    timestamptz default now(),
  unique(user_id, external_id)
);

alter table public.transactions enable row level security;

drop policy if exists "Users can read own transactions"   on public.transactions;
drop policy if exists "Users can insert own transactions" on public.transactions;
drop policy if exists "Users can update own transactions" on public.transactions;
drop policy if exists "Users can delete own transactions" on public.transactions;

create policy "Users can read own transactions"   on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);
