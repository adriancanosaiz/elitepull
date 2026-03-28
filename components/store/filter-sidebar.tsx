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
  formats,
  languages,
  price,
  compact = false,
}: {
  brands: CollectionFilterOption[];
  categories: CollectionFilterOption[];
  expansions: CollectionFilterOption[];
  formats: CollectionFilterOption[];
  languages: CollectionFilterOption[];
  price: CollectionResponse["filters"]["price"];
  compact?: boolean;
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
    params.delete("page");
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
    <aside
      className={[
        "surface-card relative h-fit overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(14,18,29,0.96),rgba(9,12,19,0.9))] shadow-[0_20px_48px_rgba(4,8,18,0.18)]",
        compact ? "p-4" : "p-5 lg:sticky lg:top-28",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="flex items-start justify-between gap-3">
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Navegacion
          </p>
          <h2 className="mt-2 font-heading text-xl font-semibold text-white sm:text-2xl">
            Refina la coleccion
          </h2>
          <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
            Ajusta marca, categoria, expansion y disponibilidad sin salir del listing.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="relative rounded-full border-white/[0.12] bg-black/[0.16]"
          onClick={() => router.push(pathname, { scroll: false })}
        >
          Limpiar
        </Button>
      </div>

      <div className="relative mt-5 space-y-3.5 sm:mt-6 sm:space-y-4">
        <FilterBlock title="Marca">
          <PillWrap>
            {brands.map((brand) => (
              <FilterPill
                key={brand.value}
                active={isActive("brand", brand.value)}
                count={brand.count}
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
                count={category.count}
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
                  count={expansion.count}
                  onClick={() => toggleMultiParam("expansion", expansion.value)}
                >
                  {expansion.label}
                </FilterPill>
              ))}
            </PillWrap>
          </FilterBlock>
        ) : null}

        {formats.length > 0 ? (
          <FilterBlock title="Formato">
            <PillWrap>
              {formats.map((format) => (
                <FilterPill
                  key={format.value}
                  active={isActive("format", format.value)}
                  count={format.count}
                  onClick={() => toggleMultiParam("format", format.value)}
                >
                  {format.label}
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
                  count={language.count}
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
    <div className="rounded-[20px] border border-white/[0.08] bg-black/[0.16] p-3.5 sm:rounded-[22px] sm:p-4">
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
  count,
  children,
  onClick,
}: {
  active: boolean;
  count?: number;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-[border-color,background-color,color,box-shadow]",
        active
          ? "border-primary/35 bg-primary/15 text-primary shadow-[0_8px_18px_rgba(234,179,8,0.12)]"
          : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white",
      ].join(" ")}
    >
      <span>{children}</span>
      {typeof count === "number" ? (
        <span
          className={[
            "inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px]",
            active ? "bg-primary/18 text-primary" : "bg-black/[0.22] text-slate-400",
          ].join(" ")}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
