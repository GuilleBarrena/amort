-- Add close/delete tracking fields to entries
alter table public.entries
  add column if not exists deleted_at      timestamptz,
  add column if not exists closed_at       timestamptz,
  add column if not exists close_type      text check (close_type in ('sold', 'cancelled')),
  add column if not exists sale_price      numeric,
  add column if not exists total_expenses  numeric;
