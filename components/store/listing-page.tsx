import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { CategoryPill } from "@/components/store/category-pill";
import { EmptyState } from "@/components/store/empty-state";
import { FilterSidebar } from "@/components/store/filter-sidebar";
import { ProductGrid } from "@/components/store/product-grid";
import { SortBar } from "@/components/store/sort-bar";
import { cn } from "@/lib/utils";
import type { CollectionResponse } from "@/types/contracts";
import type { Brand } from "@/types/store";

export function ListingPage({
  title,
  description,
  eyebrow,
  collection,
  breadcrumbs,
  brand,
  resetHref,
  categoryPills = [],
}: {
  title: string;
  description: string;
  eyebrow: string;
  collection: CollectionResponse;
  breadcrumbs: Array<{ label: string; href?: string }>;
  brand?: Brand;
  resetHref: string;
  categoryPills?: Array<{ label: string; href: string; active?: boolean }>;
}) {
  return (
    <section className="app-container pb-8 pt-8 md:pt-10">
      <div
        className={cn(
          "surface-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10",
          brand?.theme.glow,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-40",
            brand?.theme.from ?? "from-primary/[0.15]",
            brand?.theme.via ?? "via-white/5",
            brand?.theme.to ?? "to-accent/[0.15]",
          )}
        />
        <div className="relative">
          <Breadcrumbs items={breadcrumbs} />
          <span className="eyebrow-label mt-6">{eyebrow}</span>
          <h1 className="mt-5 font-heading text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{description}</p>

          {categoryPills.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {categoryPills.map((pill) => (
                <CategoryPill
                  key={pill.href}
                  label={pill.label}
                  href={pill.href}
                  active={pill.active}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[320px_1fr]">
        <FilterSidebar
          brands={collection.filters.brands}
          categories={collection.filters.categories}
          expansions={collection.filters.expansions}
          languages={collection.filters.languages}
          price={collection.filters.price}
        />

        <div className="space-y-5">
          <SortBar resultCount={collection.total} />

          {collection.items.length > 0 ? (
            <ProductGrid products={collection.items} />
          ) : (
            <EmptyState
              className="min-h-[320px]"
              title="No hay resultados con estos filtros"
              description="Prueba a limpiar algun filtro o explorar otra expansion, marca o rango de precio."
              action={{ label: "Limpiar filtros", href: resetHref }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
