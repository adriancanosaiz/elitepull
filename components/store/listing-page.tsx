import Image from "next/image";

import { ActiveFiltersBar } from "@/components/store/active-filters-bar";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { CollectionPagination } from "@/components/store/collection-pagination";
import { EmptyState } from "@/components/store/empty-state";
import { FilterSidebar } from "@/components/store/filter-sidebar";
import { MobileFilterDrawer } from "@/components/store/mobile-filter-drawer";
import { ProductGrid } from "@/components/store/product-grid";
import { SortBar } from "@/components/store/sort-bar";
import { StoreReveal } from "@/components/store/store-reveal";
import { brandMedia } from "@/data/brand-media";
import { brandPalettes } from "@/data/brand-palettes";
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
  heroVariant = "default",
}: {
  title: string;
  description: string;
  eyebrow?: string;
  collection: CollectionResponse;
  breadcrumbs: Array<{ label: string; href?: string }>;
  brand?: Brand;
  resetHref: string;
  heroVariant?: "default" | "logo-only";
}) {
  const brandLogoSrc = brand ? brandMedia[brand.slug]?.logo : undefined;
  const brandPalette = brand ? brandPalettes[brand.slug] : undefined;
  const showLogoOnlyHero = heroVariant === "logo-only" && Boolean(brandLogoSrc);
  const hideVisualTitle = Boolean(
    brand &&
      brandLogoSrc &&
      (showLogoOnlyHero || title === brand.name || title === brand.shortName),
  );

  return (
    <section
      className={cn(
        "app-container pb-8 pt-8 md:pt-10",
        showLogoOnlyHero && "pb-6 pt-5 md:pt-6",
      )}
    >
      <StoreReveal>
        <div
          className={cn(
            showLogoOnlyHero
              ? "relative px-2 py-0 sm:px-4 sm:py-0"
              : "surface-panel relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10",
            !showLogoOnlyHero && brand?.theme.glow,
          )}
        >
          {!showLogoOnlyHero ? (
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-40",
                brand?.theme.from ?? "from-primary/[0.15]",
                brand?.theme.via ?? "via-white/5",
                brand?.theme.to ?? "to-accent/[0.15]",
              )}
            />
          ) : null}
          <div
            className={cn(
              "relative",
              showLogoOnlyHero && "flex min-h-[88px] flex-col justify-center md:min-h-[108px] lg:min-h-[120px]",
            )}
          >
            <Breadcrumbs items={breadcrumbs} />
            {!showLogoOnlyHero && eyebrow ? <span className="eyebrow-label mt-6">{eyebrow}</span> : null}
            {brandLogoSrc ? (
              <div
                className={cn(
                  showLogoOnlyHero
                    ? "relative mx-auto mt-2 h-44 w-full max-w-[560px] sm:h-52 sm:max-w-[720px] md:h-64 md:max-w-[980px] lg:h-[19rem] lg:max-w-[1220px] xl:h-[22rem] xl:max-w-[1480px]"
                    : "relative mt-6 h-14 w-[180px] sm:h-16 sm:w-[220px] md:h-20 md:w-[280px]",
                  !showLogoOnlyHero && eyebrow ? "md:mt-5" : "",
                )}
                style={
                  showLogoOnlyHero && brandPalette
                    ? {
                        filter: brandPalette.logoShadow,
                      }
                    : undefined
                }
              >
                <Image
                  src={brandLogoSrc}
                  alt={`${brand?.name ?? title} logo`}
                  fill
                  className={cn(
                    "object-contain",
                    showLogoOnlyHero ? "object-center" : "object-left",
                  )}
                  sizes={showLogoOnlyHero ? "(min-width: 1280px) 1220px, (min-width: 1024px) 1220px, (min-width: 768px) 980px, 100vw" : "(min-width: 768px) 280px, 220px"}
                  priority
                />
              </div>
            ) : null}
            <h1
              className={cn(
                "font-heading text-4xl font-semibold tracking-tight text-white md:text-5xl",
                brandLogoSrc ? "mt-5" : eyebrow ? "mt-5" : "mt-6",
                hideVisualTitle && "sr-only",
              )}
            >
              {title}
            </h1>
            {!showLogoOnlyHero ? (
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{description}</p>
            ) : null}
          </div>
        </div>
      </StoreReveal>

      <div className="mt-6 grid gap-6 xl:mt-8 xl:grid-cols-[320px_1fr]">
        <StoreReveal delay={0.05} className="hidden xl:block">
          <FilterSidebar
            brands={collection.filters.brands}
            categories={collection.filters.categories}
            expansions={collection.filters.expansions}
            formats={collection.filters.formats}
            languages={collection.filters.languages}
            price={collection.filters.price}
          />
        </StoreReveal>

        <StoreReveal className="space-y-5" delay={0.1}>
          <MobileFilterDrawer collection={collection} />

          <SortBar
            resultCount={collection.total}
            page={collection.pagination.page}
            pageSize={collection.pagination.pageSize}
            visibleCount={collection.items.length}
          />

          <ActiveFiltersBar basePath={resetHref} collection={collection} />

          {collection.items.length > 0 ? (
            <>
              <ProductGrid products={collection.items} />
              <CollectionPagination
                currentPage={collection.pagination.page}
                pageCount={collection.pagination.pageCount}
              />
            </>
          ) : (
            <EmptyState
              className="min-h-[320px]"
              title="No hay resultados con estos filtros"
              description="Prueba a limpiar algun filtro o explorar otra expansion, marca o rango de precio."
              action={{ label: "Limpiar filtros", href: resetHref }}
            />
          )}
        </StoreReveal>
      </div>
    </section>
  );
}
