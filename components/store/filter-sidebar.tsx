"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { priceRanges } from "@/lib/catalog";
import type { CollectionFilterOption, CollectionResponse } from "@/types/contracts";

function parseValues(value: string | null) {
  if (!value) {
    return [];
  }

  return value.split(",").filter(Boolean);
}

function getRangeMax(range: (typeof priceRanges)[number]) {
  return "max" in range ? range.max : undefined;
}

export function FilterSidebar({
  brands,
  categories,
  expansions,
  languages,
  price,
}: {
  brands: CollectionFilterOption[];
  categories: CollectionFilterOption[];
  expansions: CollectionFilterOption[];
  languages: CollectionFilterOption[];
  price: CollectionResponse["filters"]["price"];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activePriceMin = searchParams.get("priceMin");
  const activePriceMax = searchParams.get("priceMax");
  const visiblePriceRanges = priceRanges.filter((range) => {
    const max = getRangeMax(range) ?? Number.POSITIVE_INFINITY;

    return max >= price.min && range.min <= price.max;
  });

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleMultiParam(key: string, value: string) {
    updateParams((params) => {
      const current = parseValues(params.get(key));
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];

      if (next.length > 0) {
        params.set(key, next.join(","));
      } else {
        params.delete(key);
      }
    });
  }

  function toggleBooleanParam(key: string) {
    updateParams((params) => {
      if (params.get(key) === "1") {
        params.delete(key);
      } else {
        params.set(key, "1");
      }
    });
  }

  function setPriceRange(min: number, max?: number) {
    updateParams((params) => {
      const nextMin = String(min);
      const nextMax = typeof max === "number" ? String(max) : null;

      if (activePriceMin === nextMin && activePriceMax === nextMax) {
        params.delete("priceMin");
        params.delete("priceMax");
        return;
      }

      params.set("priceMin", nextMin);

      if (nextMax) {
        params.set("priceMax", nextMax);
      } else {
        params.delete("priceMax");
      }
    });
  }

  function isActive(key: string, value: string) {
    return parseValues(searchParams.get(key)).includes(value);
  }

  function isToggleActive(key: string) {
    return searchParams.get(key) === "1";
  }

  return (
    <aside className="surface-card h-fit p-5 lg:sticky lg:top-28">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Filtros
          </p>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white">
            Refina la coleccion
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname, { scroll: false })}>
          Limpiar
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        <FilterBlock title="Marca">
          <PillWrap>
            {brands.map((brand) => (
              <FilterPill
                key={brand.value}
                active={isActive("brand", brand.value)}
                onClick={() => toggleMultiParam("brand", brand.value)}
              >
                {brand.label}
              </FilterPill>
            ))}
          </PillWrap>
        </FilterBlock>

        <FilterBlock title="Categoria">
          <PillWrap>
            {categories.map((category) => (
              <FilterPill
                key={category.value}
                active={isActive("category", category.value)}
                onClick={() => toggleMultiParam("category", category.value)}
              >
                {category.label}
              </FilterPill>
            ))}
          </PillWrap>
        </FilterBlock>

        {expansions.length > 0 ? (
          <FilterBlock title="Expansion">
            <PillWrap>
              {expansions.map((expansion) => (
                <FilterPill
                  key={expansion.value}
                  active={isActive("expansion", expansion.value)}
                  onClick={() => toggleMultiParam("expansion", expansion.value)}
                >
                  {expansion.label}
                </FilterPill>
              ))}
            </PillWrap>
          </FilterBlock>
        ) : null}

        {languages.length > 0 ? (
          <FilterBlock title="Idioma">
            <PillWrap>
              {languages.map((language) => (
                <FilterPill
                  key={language.value}
                  active={isActive("language", language.value)}
                  onClick={() => toggleMultiParam("language", language.value)}
                >
                  {language.label}
                </FilterPill>
              ))}
            </PillWrap>
          </FilterBlock>
        ) : null}

        {visiblePriceRanges.length > 0 ? (
          <FilterBlock title="Precio">
            <PillWrap>
              {visiblePriceRanges.map((range) => (
                <FilterPill
                  key={`${range.min}-${getRangeMax(range) ?? "plus"}`}
                  active={
                    activePriceMin === String(range.min) &&
                    activePriceMax ===
                      (typeof getRangeMax(range) === "number"
                        ? String(getRangeMax(range))
                        : null)
                  }
                  onClick={() => setPriceRange(range.min, getRangeMax(range))}
                >
                  {range.label}
                </FilterPill>
              ))}
            </PillWrap>
          </FilterBlock>
        ) : null}

        <FilterBlock title="Estado">
          <PillWrap>
            <FilterPill
              active={isToggleActive("inStock")}
              onClick={() => toggleBooleanParam("inStock")}
            >
              En stock
            </FilterPill>
            <FilterPill
              active={isToggleActive("isPreorder")}
              onClick={() => toggleBooleanParam("isPreorder")}
            >
              Preventa
            </FilterPill>
            <FilterPill
              active={isToggleActive("featured")}
              onClick={() => toggleBooleanParam("featured")}
            >
              Destacado
            </FilterPill>
          </PillWrap>
        </FilterBlock>
      </div>
    </aside>
  );
}

function FilterBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function PillWrap({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full border border-primary/35 bg-primary/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary"
          : "rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 transition-colors hover:bg-white/[0.08] hover:text-white"
      }
    >
      {children}
    </button>
  );
}
