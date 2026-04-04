do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'products'
      and constraint_name = 'products_category_id_fkey'
  ) then
    alter table public.products
      drop constraint products_category_id_fkey;
  end if;
end $$;

drop index if exists public.idx_products_category_id;

alter table public.products
  drop column if exists category_id;

drop policy if exists "Public read active categories" on public.categories;
drop trigger if exists set_categories_updated_at on public.categories;
drop table if exists public.categories;
