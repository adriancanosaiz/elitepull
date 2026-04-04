"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Layers, Search, Sparkles, Tag } from "lucide-react";

import { BrandGlyph } from "@/components/store/brand-glyph";
import { brands } from "@/data/brands";
import { searchSuggestions } from "@/data/site";
import { getCatalogRoute } from "@/lib/routes/store-routes";
import { normalizeSlug } from "@/lib/routes/slugs";
import { cn } from "@/lib/utils";
import type { BrandSlug } from "@/types/store";

type SearchTarget = {
  id: string;
  label: string;
  description: string;
  href: string;
  brand?: BrandSlug;
  keywords: string[];
  kind: "brand" | "category";
};

const searchTargets: SearchTarget[] = [
  ...brands.map((brand) => ({
    id: `brand-${brand.slug}`,
    label: brand.name,
    description: brand.tagline,
    href: brand.href,
    brand: brand.slug,
    keywords: [brand.name, brand.shortName, brand.slug, brand.spotlight],
    kind: "brand" as const,
  })),
  ...brands.flatMap((brand) =>
    brand.categories.map((category) => ({
      id: `category-${brand.slug}-${category.slug}`,
      label: category.label,
      description: `${brand.shortName} · ${category.description}`,
      href: category.href,
      brand: brand.slug,
      keywords: [brand.name, brand.shortName, category.label, category.slug, category.description],
      kind: "category" as const,
    })),
  ),
];

function normalizeSearchText(value: string) {
  return normalizeSlug(value).replace(/-/g, " ");
}

function resolveSearchResults(query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return searchTargets.filter((target) => target.kind === "brand").slice(0, 6);
  }

  return searchTargets
    .filter((target) => {
      const haystack = normalizeSearchText(
        [target.label, target.description, ...target.keywords].join(" "),
      );

      return haystack.includes(normalizedQuery);
    })
    .sort((left, right) => {
      const leftLabel = normalizeSearchText(left.label);
      const rightLabel = normalizeSearchText(right.label);
      const leftStarts = leftLabel.startsWith(normalizedQuery) ? 0 : 1;
      const rightStarts = rightLabel.startsWith(normalizedQuery) ? 0 : 1;
      const leftKind = left.kind === "brand" ? 0 : 1;
      const rightKind = right.kind === "brand" ? 0 : 1;

      return (
        leftStarts - rightStarts ||
        leftKind - rightKind ||
        left.label.localeCompare(right.label, "es")
      );
    });
}

export function SearchBar({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const maxResults = compact ? 5 : 6;
  const results = resolveSearchResults(query).slice(0, maxResults);
  const hasQuery = query.trim().length > 0;

  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (highlightIndex >= 0 && results[highlightIndex]) {
      navigateTo(results[highlightIndex].href);
      return;
    }

    if (results[0]) {
      navigateTo(results[0].href);
      return;
    }

    navigateTo(getCatalogRoute());
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        setHighlightIndex(-1);
        break;
    }
  }

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-search-item]");
    items[highlightIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-3 rounded-[20px] border border-primary/15 bg-[linear-gradient(180deg,rgba(18,22,32,0.92),rgba(10,13,20,0.85))] px-4 py-3 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors hover:border-primary/25 hover:bg-[linear-gradient(180deg,rgba(20,24,36,0.96),rgba(12,15,22,0.9))]",
          compact ? "h-11 px-3 py-2" : "h-12",
          open && "border-primary/30",
        )}
      >
        <Search aria-hidden="true" className="pointer-events-none h-4 w-4 shrink-0 text-primary/80" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
          placeholder={`Busca ${searchSuggestions[0]}, cartas sueltas, cajas...`}
          aria-label="Buscar en la tienda"
          aria-expanded={open}
          aria-controls="search-results-dropdown"
          aria-activedescendant={
            highlightIndex >= 0 ? `search-item-${highlightIndex}` : undefined
          }
          role="combobox"
          autoComplete="off"
        />
        {!compact ? (
          <button
            type="submit"
            className="hidden items-center gap-1 rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent transition-colors hover:border-accent/30 hover:bg-accent/14 lg:inline-flex"
          >
            <Sparkles className="h-3 w-3" />
            Buscar
          </button>
        ) : null}
      </form>

      <AnimatePresence>
        {open && (results.length > 0 || hasQuery) ? (
          <motion.div
            id="search-results-dropdown"
            ref={listRef}
            role="listbox"
            aria-label="Resultados de búsqueda"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 z-50 mt-2 max-h-[400px] overflow-y-auto overflow-x-hidden rounded-[24px] border border-primary/16 bg-[linear-gradient(180deg,rgba(14,18,28,0.98),rgba(8,11,18,0.98))] p-2 shadow-[0_24px_64px_rgba(2,6,23,0.48),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl",
              compact && "max-h-[320px]",
            )}
          >
            {results.length > 0 ? (
              <>
                {!hasQuery ? (
                  <p className="mb-2 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Sugerencias
                  </p>
                ) : (
                  <p className="mb-2 px-3 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {results.length} {results.length === 1 ? "resultado" : "resultados"}
                  </p>
                )}
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    id={`search-item-${index}`}
                    data-search-item
                    type="button"
                    role="option"
                    aria-selected={highlightIndex === index}
                    onClick={() => navigateTo(result.href)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition-colors duration-150",
                      highlightIndex === index
                        ? "bg-white/[0.08] text-white"
                        : "text-slate-200 hover:bg-white/[0.05]",
                    )}
                  >
                    {result.kind === "brand" && result.brand ? (
                      <BrandGlyph brand={result.brand} size="sm" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-white/[0.04]">
                        {result.kind === "brand" ? (
                          <Layers className="h-4 w-4 text-primary/80" />
                        ) : (
                          <Tag className="h-4 w-4 text-accent/80" />
                        )}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{result.label}</p>
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">
                        {result.description}
                      </p>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-slate-500 transition-colors",
                        highlightIndex === index && "text-primary",
                      )}
                    />
                  </button>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
                <Search className="h-5 w-5 text-slate-500" />
                <p className="text-sm font-medium text-slate-300">
                  Sin resultados para &quot;{query}&quot;
                </p>
                <p className="text-xs text-slate-500">
                  Prueba con{" "}
                  {searchSuggestions.slice(0, 3).map((suggestion, index) => (
                    <span key={suggestion}>
                      {index > 0 && ", "}
                      <button
                        type="button"
                        className="text-primary transition-colors hover:text-white"
                        onClick={() => {
                          setQuery(suggestion);
                          inputRef.current?.focus();
                        }}
                      >
                        {suggestion}
                      </button>
                    </span>
                  ))}
                </p>
              </div>
            )}

            <div className="mt-1 border-t border-white/[0.06] px-3 pt-2 pb-1">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                <Sparkles className="h-3 w-3 text-primary/60" />
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold">↑↓</kbd>
                navegar
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold">↵</kbd>
                ir
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-semibold">esc</kbd>
                cerrar
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
