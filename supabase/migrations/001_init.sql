-- Run this in Supabase SQL Editor

-- ITEMS table (amortization purchases)
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  price      numeric not null,
  monthly    numeric not null,
  date_str   text not null,
  created_at timestamptz default now()
);

-- SUBS table (subscriptions)
create table if not exists public.subs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  icon       text default '📦',
  price      numeric not null,
  period     text not null default 'monthly',
  category   text not null default 'otros',
  since      text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.items enable row level security;
alter table public.subs  enable row level security;

-- RLS Policies: users can only access their own rows
drop policy if exists "Users can read own items"   on public.items;
drop policy if exists "Users can insert own items" on public.items;
drop policy if exists "Users can update own items" on public.items;
drop policy if exists "Users can delete own items" on public.items;

create policy "Users can read own items"   on public.items for select using (auth.uid() = user_id);
create policy "Users can insert own items" on public.items for insert with check (auth.uid() = user_id);
create policy "Users can update own items" on public.items for update using (auth.uid() = user_id);
create policy "Users can delete own items" on public.items for delete using (auth.uid() = user_id);

drop policy if exists "Users can read own subs"   on public.subs;
drop policy if exists "Users can insert own subs" on public.subs;
drop policy if exists "Users can update own subs" on public.subs;
drop policy if exists "Users can delete own subs" on public.subs;

create policy "Users can read own subs"   on public.subs for select using (auth.uid() = user_id);
create policy "Users can insert own subs" on public.subs for insert with check (auth.uid() = user_id);
create policy "Users can update own subs" on public.subs for update using (auth.uid() = user_id);
create policy "Users can delete own subs" on public.subs for delete using (auth.uid() = user_id);
