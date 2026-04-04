"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronRight, Layers, Search, Sparkles, Tag, X } from "lucide-react";

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

export function MobileSearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = resolveSearchResults(query).slice(0, 8);
  const hasQuery = query.trim().length > 0;

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function navigate(href: string) {
    onClose();
    router.push(href);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (results[0]) {
      navigate(results[0].href);
    } else {
      navigate(getCatalogRoute());
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm xl:hidden"
            onClick={onClose}
          />

          {/* Modal panel — slides up from bottom */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.9 }}
            className="fixed inset-x-0 bottom-0 z-[61] xl:hidden"
            style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-3 mb-[calc(72px+0.5rem)] overflow-hidden rounded-[24px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(12,16,26,0.99),rgba(7,9,16,0.99))] shadow-[0_-24px_64px_rgba(2,6,23,0.6)] backdrop-blur-2xl">
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-white/20" />
              </div>

              {/* Search input */}
              <form onSubmit={handleSubmit} className="px-4 pt-2 pb-3">
                <div className="flex items-center gap-3 rounded-[20px] border border-white/[0.12] bg-white/[0.06] px-4 py-3">
                  <Search className="h-4 w-4 shrink-0 text-primary/80" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-400 focus:outline-none"
                    placeholder={`Busca Pokémon, Magic, cartas...`}
                    aria-label="Buscar en la tienda"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                  {hasQuery && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="shrink-0 rounded-full p-1 text-slate-400 active:opacity-60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Results */}
              {!hasQuery && (
                <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Sugerencias rápidas
                </p>
              )}

              <div className="max-h-[55svh] overflow-y-auto px-2 pb-2">
                {results.length > 0 ? (
                  results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => navigate(result.href)}
                      className="flex w-full items-center gap-3 rounded-[16px] px-3 py-3 text-left transition-colors active:bg-white/[0.08]"
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
                        <p className="truncate text-sm font-semibold text-white">{result.label}</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {result.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" />
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                    <Search className="h-5 w-5 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">Sin resultados para &quot;{query}&quot;</p>
                    <p className="text-xs text-slate-500">Prueba con otro término</p>
                  </div>
                )}
              </div>

              {/* Quick suggestions row */}
              <div className="flex flex-wrap gap-2 border-t border-white/[0.06] px-4 pt-3 pb-2">
                {searchSuggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className={cn(
                      "rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5",
                      "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300",
                      "active:opacity-60 transition-opacity",
                      query === s && "border-primary/30 bg-primary/10 text-primary",
                    )}
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => navigate(getCatalogRoute())}
                  className="ml-auto flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary active:opacity-60"
                >
                  <Sparkles className="h-3 w-3" />
                  Ver todo
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
