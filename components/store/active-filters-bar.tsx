import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildCollectionQueryString } from "@/lib/routes/query-params";
import type { CollectionResponse } from "@/types/contracts";
import type { ListingFilters } from "@/types/store";

function buildHref(basePath: string, nextFilters: Partial<ListingFilters>) {
  const query = buildCollectionQueryString(nextFilters);
  return query ? `${basePath}?${query}` : basePath;
}

function withoutValue<T extends string>(values: T[], value: T) {
  return values.filter((entry) => entry !== value);
}

function formatPriceFilter(priceMin?: number, priceMax?: number) {
  if (typeof priceMin === "number" && typeof priceMax === "number") {
    return `${priceMin} - ${priceMax} EUR`;
  }

  if (typeof priceMin === "number") {
    return `Desde ${priceMin} EUR`;
  }

  if (typeof priceMax === "number") {
    return `Hasta ${priceMax} EUR`;
  }

  return null;
}

export function ActiveFiltersBar({
  basePath,
  collection,
}: {
  basePath: string;
  collection: CollectionResponse;
}) {
  const { query, filters } = collection;
  const brandLabels = new Map(filters.brands.map((brand) => [brand.value, brand.label]));
  const categoryLabels = new Map(filters.categories.map((category) => [category.value, category.label]));
  const expansionLabels = new Map(
    filters.expansions.map((expansion) => [expansion.value, expansion.label]),
  );
  const formatLabels = new Map(
    filters.formats.map((format) => [format.value, format.label]),
  );
  const languageLabels = new Map(
    filters.languages.map((language) => [language.value, language.label]),
  );

  const activeFilters = [
    ...query.brand.map((brand) => ({
      key: `brand-${brand}`,
      label: `Marca: ${brandLabels.get(brand) ?? brand}`,
      href: buildHref(basePath, {
        ...query,
        brand: withoutValue(query.brand, brand),
        page: 1,
      }),
    })),
    ...query.category.map((category) => ({
      key: `category-${category}`,
      label: `Categoria: ${categoryLabels.get(category) ?? category}`,
      href: buildHref(basePath, {
        ...query,
        category: withoutValue(query.category, category),
        page: 1,
      }),
    })),
    ...query.expansion.map((expansion) => ({
      key: `expansion-${expansion}`,
      label: `Expansion: ${expansionLabels.get(expansion) ?? expansion}`,
      href: buildHref(basePath, {
        ...query,
        expansion: withoutValue(query.expansion, expansion),
        page: 1,
      }),
    })),
    ...query.format.map((format) => ({
      key: `format-${format}`,
      label: `Formato: ${formatLabels.get(format) ?? format}`,
      href: buildHref(basePath, {
        ...query,
        format: withoutValue(query.format, format),
        page: 1,
      }),
    })),
    ...query.language.map((language) => ({
      key: `language-${language}`,
      label: `Idioma: ${languageLabels.get(language) ?? language}`,
      href: buildHref(basePath, {
        ...query,
        language: withoutValue(query.language, language),
        page: 1,
      }),
    })),
    ...(query.inStock
      ? [
          {
            key: "inStock",
            label: "En stock",
            href: buildHref(basePath, {
              ...query,
              inStock: false,
              page: 1,
            }),
          },
        ]
      : []),
    ...(query.isPreorder
      ? [
          {
            key: "isPreorder",
            label: "Preventa",
            href: buildHref(basePath, {
              ...query,
              isPreorder: false,
              page: 1,
            }),
          },
        ]
      : []),
    ...(query.featured
      ? [
          {
            key: "featured",
            label: "Destacado",
            href: buildHref(basePath, {
              ...query,
              featured: false,
              page: 1,
            }),
          },
        ]
      : []),
    ...(formatPriceFilter(query.priceMin, query.priceMax)
      ? [
          {
            key: "price",
            label: `Precio: ${formatPriceFilter(query.priceMin, query.priceMax)}`,
            href: buildHref(basePath, {
              ...query,
              priceMin: undefined,
              priceMax: undefined,
              page: 1,
            }),
          },
        ]
      : []),
  ];

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="surface-soft overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-4 py-4 shadow-[0_14px_40px_rgba(4,8,18,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Filtros activos
            </p>
            <p className="mt-1 text-sm text-slate-300">
              Ajusta el listado quitando chips individuales o limpiando la vista completa.
            </p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={basePath}>Limpiar filtros</Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <Link
            key={filter.key}
            href={filter.href}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-black/[0.22] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-100 transition-colors hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
          >
            <span>{filter.label}</span>
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
              <X className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
