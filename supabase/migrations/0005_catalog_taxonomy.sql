create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.product_languages (
  code text primary key check (code in ('ES', 'EN', 'JP')),
  label text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.product_formats (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.expansions (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  slug text not null,
  label text not null,
  release_status text not null default 'live' check (release_status in ('upcoming', 'live', 'archived')),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (brand_id, slug)
);

create table if not exists public.expansion_format_availability (
  id uuid primary key default gen_random_uuid(),
  expansion_id uuid not null references public.expansions(id) on delete cascade,
  format_id uuid not null references public.product_formats(id) on delete cascade,
  language_code text not null references public.product_languages(code) on delete restrict,
  variant_label text,
  active boolean not null default true,
  is_preorder_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists idx_expansion_format_availability_unique
  on public.expansion_format_availability (
    expansion_id,
    format_id,
    language_code,
    coalesce(variant_label, '')
  );

create index if not exists idx_brands_sort_order on public.brands (sort_order, active);
create index if not exists idx_product_languages_sort_order on public.product_languages (sort_order, active);
create index if not exists idx_product_formats_sort_order on public.product_formats (sort_order, active);
create index if not exists idx_expansions_brand_id on public.expansions (brand_id, sort_order, active);
create index if not exists idx_expansion_format_availability_expansion_id
  on public.expansion_format_availability (expansion_id, sort_order, active);
create index if not exists idx_expansion_format_availability_format_id
  on public.expansion_format_availability (format_id, language_code);

drop trigger if exists set_brands_updated_at on public.brands;
create trigger set_brands_updated_at
before update on public.brands
for each row
execute function public.set_updated_at();

drop trigger if exists set_product_languages_updated_at on public.product_languages;
create trigger set_product_languages_updated_at
before update on public.product_languages
for each row
execute function public.set_updated_at();

drop trigger if exists set_product_formats_updated_at on public.product_formats;
create trigger set_product_formats_updated_at
before update on public.product_formats
for each row
execute function public.set_updated_at();

drop trigger if exists set_expansions_updated_at on public.expansions;
create trigger set_expansions_updated_at
before update on public.expansions
for each row
execute function public.set_updated_at();

drop trigger if exists set_expansion_format_availability_updated_at on public.expansion_format_availability;
create trigger set_expansion_format_availability_updated_at
before update on public.expansion_format_availability
for each row
execute function public.set_updated_at();

alter table public.brands enable row level security;
alter table public.product_languages enable row level security;
alter table public.product_formats enable row level security;
alter table public.expansions enable row level security;
alter table public.expansion_format_availability enable row level security;

drop policy if exists "Public read active brands" on public.brands;
create policy "Public read active brands"
on public.brands
for select
using (active = true);

drop policy if exists "Public read active product languages" on public.product_languages;
create policy "Public read active product languages"
on public.product_languages
for select
using (active = true);

drop policy if exists "Public read active product formats" on public.product_formats;
create policy "Public read active product formats"
on public.product_formats
for select
using (active = true);

drop policy if exists "Public read active expansions" on public.expansions;
create policy "Public read active expansions"
on public.expansions
for select
using (active = true);

drop policy if exists "Public read active expansion format availability" on public.expansion_format_availability;
create policy "Public read active expansion format availability"
on public.expansion_format_availability
for select
using (
  active = true
  and exists (
    select 1
    from public.expansions
    where public.expansions.id = expansion_format_availability.expansion_id
      and public.expansions.active = true
  )
  and exists (
    select 1
    from public.product_formats
    where public.product_formats.id = expansion_format_availability.format_id
      and public.product_formats.active = true
  )
);

insert into public.brands (slug, label, sort_order)
values
  ('pokemon', 'Pokemon', 10),
  ('one-piece', 'One Piece', 20),
  ('magic', 'Magic', 30),
  ('riftbound', 'Riftbound', 40),
  ('accesorios', 'Accesorios', 50)
on conflict (slug) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  active = true;

insert into public.product_languages (code, label, sort_order)
values
  ('ES', 'Espanol', 10),
  ('EN', 'English', 20),
  ('JP', 'Japanese', 30)
on conflict (code) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  active = true;

insert into public.product_formats (slug, label, sort_order)
values
  ('etb', 'ETB', 10),
  ('sobres', 'Sobres', 20),
  ('booster-packs', 'Booster Packs', 30),
  ('blister', 'Blister', 40),
  ('cajas', 'Cajas', 50),
  ('ediciones-especiales', 'Ediciones especiales', 60),
  ('collector-booster-packs', 'Collector Booster Packs', 70),
  ('commander-decks', 'Commander Decks', 80),
  ('bundle', 'Bundle', 90),
  ('cartas-individuales', 'Cartas individuales', 100),
  ('fundas', 'Fundas', 110),
  ('deck-boxes', 'Deck Boxes', 120),
  ('binders', 'Binders', 130),
  ('toploaders', 'Toploaders', 140),
  ('dados-tapetes', 'Dados y tapetes', 150)
on conflict (slug) do update
set
  label = excluded.label,
  sort_order = excluded.sort_order,
  active = true;

with source_expansions as (
  select distinct
    p.brand_slug,
    coalesce(nullif(btrim(p.attributes ->> 'expansion'), ''), 'General') as expansion_label,
    bool_or(p.is_preorder) as has_preorder
  from public.products p
  group by p.brand_slug, coalesce(nullif(btrim(p.attributes ->> 'expansion'), ''), 'General')
),
prepared_expansions as (
  select
    b.id as brand_id,
    case
      when lower(se.expansion_label) = 'general' then 'general'
      else trim(both '-' from regexp_replace(lower(se.expansion_label), '[^a-z0-9]+', '-', 'g'))
    end as slug,
    case
      when lower(se.expansion_label) = 'general' then 'General'
      else se.expansion_label
    end as label,
    case when se.has_preorder then 'upcoming' else 'live' end as release_status,
    row_number() over (
      partition by b.id
      order by
        case when lower(se.expansion_label) = 'general' then 1 else 0 end,
        se.expansion_label
    ) * 10 as sort_order
  from source_expansions se
  inner join public.brands b on b.slug = se.brand_slug
)
insert into public.expansions (brand_id, slug, label, release_status, sort_order)
select brand_id, slug, label, release_status, sort_order
from prepared_expansions
on conflict (brand_id, slug) do update
set
  label = excluded.label,
  release_status = excluded.release_status,
  sort_order = excluded.sort_order,
  active = true;

alter table public.products
  add column if not exists brand_id uuid,
  add column if not exists expansion_id uuid,
  add column if not exists format_id uuid,
  add column if not exists language_code text,
  add column if not exists variant_label text;

update public.products p
set brand_id = b.id
from public.brands b
where p.brand_id is null
  and b.slug = p.brand_slug;

update public.products
set language_code = case
  when attributes ->> 'language' in ('ES', 'EN', 'JP') then attributes ->> 'language'
  else 'ES'
end
where language_code is null;

update public.products p
set expansion_id = e.id
from public.brands b
inner join public.expansions e on e.brand_id = b.id
where p.expansion_id is null
  and p.brand_id = b.id
  and e.slug = case
    when coalesce(nullif(btrim(p.attributes ->> 'expansion'), ''), '') = '' then 'general'
    else trim(both '-' from regexp_replace(lower(p.attributes ->> 'expansion'), '[^a-z0-9]+', '-', 'g'))
  end;

update public.products p
set format_id = f.id
from public.categories c
inner join public.product_formats f on f.slug = (
  case c.slug
    when 'etb' then 'etb'
    when 'sobres' then 'sobres'
    when 'sobres-individuales' then 'sobres'
    when 'booster-packs' then 'booster-packs'
    when 'booster-normales' then 'booster-packs'
    when 'blister-3-sobres' then 'blister'
    when 'cajas' then 'cajas'
    when 'booster-coleccion' then 'collector-booster-packs'
    when 'commander-decks' then 'commander-decks'
    when 'cartas-individuales' then 'cartas-individuales'
    when 'fundas' then 'fundas'
    when 'deck-boxes' then 'deck-boxes'
    when 'binders' then 'binders'
    when 'toploaders' then 'toploaders'
    when 'dados-tapetes' then 'dados-tapetes'
    when 'ediciones-especiales' then 'ediciones-especiales'
    else 'ediciones-especiales'
  end
)
where p.category_id = c.id
  and p.format_id is null;

insert into public.expansion_format_availability (
  expansion_id,
  format_id,
  language_code,
  variant_label,
  active,
  is_preorder_default,
  sort_order
)
select
  p.expansion_id,
  p.format_id,
  p.language_code,
  nullif(btrim(p.variant_label), '') as variant_label,
  true,
  bool_or(p.is_preorder),
  row_number() over (
    partition by p.expansion_id
    order by p.format_id, p.language_code, coalesce(nullif(btrim(p.variant_label), ''), '')
  ) * 10
from public.products p
where p.expansion_id is not null
  and p.format_id is not null
  and p.language_code is not null
group by
  p.expansion_id,
  p.format_id,
  p.language_code,
  nullif(btrim(p.variant_label), '')
on conflict do nothing;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_brand_id_fkey'
  ) then
    alter table public.products
      add constraint products_brand_id_fkey
      foreign key (brand_id) references public.brands(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_expansion_id_fkey'
  ) then
    alter table public.products
      add constraint products_expansion_id_fkey
      foreign key (expansion_id) references public.expansions(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_format_id_fkey'
  ) then
    alter table public.products
      add constraint products_format_id_fkey
      foreign key (format_id) references public.product_formats(id) on delete restrict;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_language_code_fkey'
  ) then
    alter table public.products
      add constraint products_language_code_fkey
      foreign key (language_code) references public.product_languages(code) on delete restrict;
  end if;
end $$;

alter table public.products
  alter column brand_id set not null,
  alter column expansion_id set not null,
  alter column format_id set not null,
  alter column language_code set not null;

create index if not exists idx_products_brand_id on public.products (brand_id);
create index if not exists idx_products_expansion_id on public.products (expansion_id);
create index if not exists idx_products_format_id on public.products (format_id);
create index if not exists idx_products_language_code on public.products (language_code);
create index if not exists idx_products_variant_label on public.products (variant_label);
create index if not exists idx_products_brand_expansion_format
  on public.products (brand_id, expansion_id, format_id, language_code);
