do $$
begin
  if not exists (
    select 1
    from pg_type type_entry
    join pg_namespace namespace_entry on namespace_entry.oid = type_entry.typnamespace
    where type_entry.typname = 'order_status'
      and namespace_entry.nspname = 'public'
  ) then
    create type public.order_status as enum (
      'pending_checkout',
      'checkout_created',
      'paid',
      'cancelled',
      'payment_failed'
    );
  end if;
end
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  status public.order_status not null default 'pending_checkout',
  customer_email text not null,
  customer_name text,
  amount_total numeric(10, 2) not null check (amount_total >= 0),
  currency text not null default 'eur',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  notes text,
  items_count integer not null default 0 check (items_count >= 0),
  source text not null default 'storefront',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  product_slug_snapshot text not null,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10, 2) not null check (line_total >= 0),
  product_type_snapshot text not null check (
    product_type_snapshot in ('sealed', 'single', 'accessory')
  ),
  brand_slug_snapshot text not null,
  metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists orders_stripe_checkout_session_id_idx
  on public.orders (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index if not exists orders_customer_email_idx
  on public.orders (customer_email);

create index if not exists orders_payment_intent_idx
  on public.orders (stripe_payment_intent_id)
  where stripe_payment_intent_id is not null;

create index if not exists order_items_order_id_idx
  on public.order_items (order_id);

create index if not exists order_items_product_id_idx
  on public.order_items (product_id);

create or replace function public.set_orders_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_orders_updated_at_timestamp();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins can read orders" on public.orders;
create policy "Admins can read orders"
on public.orders
for select
using (public.is_admin_or_staff());

drop policy if exists "Admins can read order items" on public.order_items;
create policy "Admins can read order items"
on public.order_items
for select
using (public.is_admin_or_staff());

grant usage on type public.order_status to anon, authenticated, service_role;
grant all on public.orders to service_role;
grant all on public.order_items to service_role;
