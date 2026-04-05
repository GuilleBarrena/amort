-- Unified entries table (replaces items + subs)
create table if not exists public.entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null check (type in ('amort', 'sub')),
  name       text not null,
  price      numeric not null,
  -- amort fields
  monthly    numeric,
  date_str   text,
  -- sub fields
  icon       text default '📦',
  period     text default 'monthly',
  category   text default 'otros',
  since      text,
  created_at timestamptz default now()
);

-- Migrate existing data
insert into public.entries (id, user_id, type, name, price, monthly, date_str, created_at)
select id, user_id, 'amort', name, price, monthly, date_str, created_at
from public.items;

insert into public.entries (id, user_id, type, name, price, icon, period, category, since, created_at)
select id, user_id, 'sub', name, price, icon, period, category, since, created_at
from public.subs;

-- Enable RLS
alter table public.entries enable row level security;

drop policy if exists "Users can read own entries"   on public.entries;
drop policy if exists "Users can insert own entries" on public.entries;
drop policy if exists "Users can update own entries" on public.entries;
drop policy if exists "Users can delete own entries" on public.entries;

create policy "Users can read own entries"   on public.entries for select using (auth.uid() = user_id);
create policy "Users can insert own entries" on public.entries for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on public.entries for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on public.entries for delete using (auth.uid() = user_id);

-- Drop old tables
drop table if exists public.items;
drop table if exists public.subs;
