create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  label text not null,
  description text,
  brand_slug text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (brand_slug, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  sku text not null unique,
  name text not null,
  description text not null,
  product_type text not null check (product_type in ('sealed', 'single', 'accessory')),
  brand_slug text not null,
  category_id uuid not null references public.categories(id) on delete restrict,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  featured boolean not null default false,
  is_preorder boolean not null default false,
  active boolean not null default true,
  main_image_path text check (main_image_path is null or btrim(main_image_path) <> ''),
  attributes jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}'::text[],
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null check (btrim(storage_path) <> ''),
  alt_text text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (product_id, storage_path),
  unique (product_id, sort_order)
);

comment on column public.products.main_image_path is
'Canonical cover image path in bucket product-media. Expected convention: products/{product_id}/cover.webp';

comment on table public.product_images is
'Additional gallery images for a product. Expected convention: products/{product_id}/gallery/01.webp, 02.webp, etc.';

comment on column public.product_images.is_primary is
'Reserved for future admin workflows. In V1 the canonical product cover comes from products.main_image_path.';

create table if not exists public.inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  available_quantity integer not null default 0 check (available_quantity >= 0),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_categories_brand_slug on public.categories (brand_slug);
create index if not exists idx_products_brand_slug on public.products (brand_slug);
create index if not exists idx_products_featured_active on public.products (featured, active);
create index if not exists idx_products_preorder_active on public.products (is_preorder, active);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_product_images_product_id on public.product_images (product_id, sort_order);
create unique index if not exists idx_product_images_single_primary
on public.product_images (product_id)
where is_primary = true;
create index if not exists idx_inventory_available_quantity on public.inventory (available_quantity);
create index if not exists idx_products_attributes on public.products using gin (attributes);
create index if not exists idx_products_tags on public.products using gin (tags);

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists set_inventory_updated_at on public.inventory;
create trigger set_inventory_updated_at
before update on public.inventory
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;

drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories"
on public.categories
for select
using (active = true);

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products"
on public.products
for select
using (active = true);

drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images"
on public.product_images
for select
using (
  exists (
    select 1
    from public.products
    where public.products.id = product_images.product_id
      and public.products.active = true
  )
);

drop policy if exists "Public read inventory for active products" on public.inventory;
create policy "Public read inventory for active products"
on public.inventory
for select
using (
  exists (
    select 1
    from public.products
    where public.products.id = inventory.product_id
      and public.products.active = true
  )
);

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read product media" on storage.objects;
create policy "Public read product media"
on storage.objects
for select
using (bucket_id = 'product-media');
