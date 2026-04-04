"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { priceRanges } from "@/lib/catalog";
import type {
  CollectionFilterOption,
  CollectionQuery,
  CollectionResponse,
} from "@/types/contracts";

function parseValues(value: string | null) {
  if (!value) {
    return [];
  }

  return value.split(",").filter(Boolean);
}

function parseOptionalNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getRangeMax(range: (typeof priceRanges)[number]) {
  return "max" in range ? range.max : undefined;
}

type MultiFilterKey = "brand" | "category" | "expansion" | "format" | "language";
type BooleanFilterKey = "inStock" | "isPreorder" | "featured";

function mergeCategoryValues(categoryValues: string[], legacyFormatValues: string[]) {
  return [...new Set([...categoryValues, ...legacyFormatValues])];
}

export function FilterSidebar({
  brands,
  categories,
  expansions,
  languages,
  price,
  compact = false,
  value,
  onChange,
  onClear,
  showClearAction = !compact,
}: {
  brands: CollectionFilterOption[];
  categories: CollectionFilterOption[];
  expansions: CollectionFilterOption[];
  languages: CollectionFilterOption[];
  price: CollectionResponse["filters"]["price"];
  compact?: boolean;
  value?: CollectionQuery;
  onChange?: (next: CollectionQuery) => void;
  onClear?: () => void;
  showClearAction?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mergedCategoryFilters = mergeCategoryValues(
    parseValues(searchParams.get("category")),
    parseValues(searchParams.get("format")),
  );
  const currentQuery: CollectionQuery =
    value ?? {
      page: Number(searchParams.get("page") ?? "1") || 1,
      sort: (searchParams.get("sort") ?? "featured") as CollectionQuery["sort"],
      brand: parseValues(searchParams.get("brand")),
      category: mergedCategoryFilters,
      expansion: parseValues(searchParams.get("expansion")),
      format: [],
      language: parseValues(searchParams.get("language")) as CollectionQuery["language"],
      priceMin: parseOptionalNumber(searchParams.get("priceMin")),
      priceMax: parseOptionalNumber(searchParams.get("priceMax")),
      inStock: searchParams.get("inStock") === "1",
      isPreorder: searchParams.get("isPreorder") === "1",
      featured: searchParams.get("featured") === "1",
    };
  const activePriceMin =
    typeof currentQuery.priceMin === "number" ? String(currentQuery.priceMin) : null;
  const activePriceMax =
    typeof currentQuery.priceMax === "number" ? String(currentQuery.priceMax) : null;
  const visiblePriceRanges = priceRanges.filter((range) => {
    const max = getRangeMax(range) ?? Number.POSITIVE_INFINITY;

    return max >= price.min && range.min <= price.max;
  });

  function updateQuery(mutator: (next: CollectionQuery) => void) {
    if (value && onChange) {
      const next: CollectionQuery = {
        ...currentQuery,
        brand: [...currentQuery.brand],
        category: [...currentQuery.category],
        expansion: [...currentQuery.expansion],
        format: [...currentQuery.format],
        language: [...currentQuery.language],
      };
      mutator(next);
      next.page = 1;
      onChange(next);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    mutator({
      ...currentQuery,
      brand: [...currentQuery.brand],
      category: [...currentQuery.category],
      expansion: [...currentQuery.expansion],
      format: [...currentQuery.format],
      language: [...currentQuery.language],
    });
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function updateParams(mutator: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutator(params);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function toggleMultiParam(key: MultiFilterKey, value: string) {
    if (onChange && value) {
      updateQuery((next) => {
        const current = next[key] as string[];
        const nextValues = current.includes(value)
          ? current.filter((entry) => entry !== value)
          : [...current, value];
        Object.assign(next, { [key]: nextValues });
      });
      return;
    }

    updateParams((params) => {
      if (key === "category") {
        params.delete("format");
      }

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

  function toggleBooleanParam(key: BooleanFilterKey) {
    if (onChange) {
      updateQuery((next) => {
        next[key] = !next[key];
      });
      return;
    }

    updateParams((params) => {
      if (params.get(key) === "1") {
        params.delete(key);
      } else {
        params.set(key, "1");
      }
    });
  }

  function setPriceRange(min: number, max?: number) {
    if (onChange) {
      updateQuery((next) => {
        const nextMin = min;
        const nextMax = max;

        if (next.priceMin === nextMin && next.priceMax === nextMax) {
          next.priceMin = undefined;
          next.priceMax = undefined;
          return;
        }

        next.priceMin = nextMin;
        next.priceMax = nextMax;
      });
      return;
    }

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

  function isActive(key: MultiFilterKey, value: string) {
    return (currentQuery[key] as string[]).includes(value);
  }

  function isToggleActive(key: BooleanFilterKey) {
    return currentQuery[key];
  }

  return (
    <aside
      className={[
        compact
          ? "relative h-fit"
          : "surface-card relative h-fit overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(14,18,29,0.96),rgba(9,12,19,0.9))] p-5 shadow-[0_20px_48px_rgba(4,8,18,0.18)] lg:sticky lg:top-28",
      ].join(" ")}
    >
      {!compact ? <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_70%)]" /> : null}
      {!compact ? (
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Navegacion
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white sm:text-2xl">
              Refina la coleccion
            </h2>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-300">
              Ajusta marca, formato, expansion y disponibilidad sin salir del listing.
            </p>
          </div>
          {showClearAction ? (
            <Button
              variant="outline"
              size="sm"
              className="relative rounded-full border-white/[0.12] bg-black/[0.16]"
              onClick={() => {
                if (onClear) {
                  onClear();
                  return;
                }

                router.push(pathname, { scroll: false });
              }}
            >
              Limpiar
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className={["relative space-y-3.5 sm:space-y-4", compact ? "" : "mt-5 sm:mt-6"].join(" ")}>
        <FilterBlock title="Marca" defaultOpen={true}>
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

        <FilterBlock title="Formato" defaultOpen={true}>
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
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-black/[0.16] sm:rounded-[22px] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-14 w-full select-none items-center justify-between p-3.5 text-left transition-colors active:bg-white/[0.04] sm:min-h-[60px] sm:p-4"
        style={{ touchAction: "pan-y" }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          {title}
        </p>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-3.5 pt-0 sm:p-4 sm:pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillWrap({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-2">{children}</div>;
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
      aria-pressed={active}
      style={{ touchAction: "pan-y" }}
      className={[
        "inline-flex min-h-12 w-full select-none items-center justify-between gap-2 rounded-[20px] border px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-[border-color,background-color,color,box-shadow]",
        active
          ? "border-primary/35 bg-primary/15 text-primary shadow-[0_8px_18px_rgba(234,179,8,0.12)]"
          : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-white/[0.18] hover:bg-white/[0.08] hover:text-white active:border-white/[0.22] active:bg-white/[0.1]",
      ].join(" ")}
    >
      <span className="line-clamp-2 text-left leading-[1.25] text-balance whitespace-normal">{children}</span>
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
