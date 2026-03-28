alter table public.orders
  add column if not exists shipping_name text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_address_json jsonb not null default '{}'::jsonb,
  add column if not exists billing_address_json jsonb not null default '{}'::jsonb,
  add column if not exists shipping_rate_label text,
  add column if not exists shipping_rate_amount numeric(10, 2);

