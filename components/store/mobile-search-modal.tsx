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

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24 }}
            className="fixed inset-0 z-[60] bg-[rgba(3,6,14,0.78)] backdrop-blur-md xl:hidden"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[61] flex items-end xl:hidden">
            <motion.div
              initial={{ y: "100%", opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.9 }}
              transition={{ type: "spring", stiffness: 340, damping: 38, mass: 0.9 }}
              className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[30px] border-t border-white/[0.12] bg-[linear-gradient(180deg,rgba(12,16,26,0.995),rgba(7,9,16,0.995))] shadow-[0_-30px_80px_rgba(2,6,23,0.64)] backdrop-blur-2xl"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_72%)]" />

              <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,16,26,0.98),rgba(12,16,26,0.92))] px-5 pb-4 pt-3 backdrop-blur-2xl">
                <div className="flex justify-center">
                  <div className="h-1 w-10 rounded-full bg-white/20" />
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Navegación
                    </p>
                    <h2 className="mt-1 font-heading text-xl font-semibold text-white">
                      Buscar
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 active:opacity-60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="flex items-center gap-3 rounded-[20px] border border-white/[0.12] bg-white/[0.06] px-4 py-3">
                    <Search className="h-4 w-4 shrink-0 text-primary/80" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-[15px] text-white placeholder:text-slate-400 focus:outline-none"
                      placeholder="Busca Pokemon, Magic, cartas..."
                      aria-label="Buscar en la tienda"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                    />
                    {hasQuery ? (
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="shrink-0 rounded-full p-1 text-slate-400 active:opacity-60"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>

              {!hasQuery ? (
                <p className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Marcas y categorías
                </p>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
                {results.length > 0 ? (
                  results.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => navigate(result.href)}
                      className="flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left transition-colors active:bg-white/[0.08]"
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
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <Search className="h-5 w-5 text-slate-600" />
                    <p className="text-sm font-medium text-slate-300">
                      Sin resultados para &quot;{query}&quot;
                    </p>
                    <p className="text-xs text-slate-500">Prueba con otro término</p>
                  </div>
                )}
              </div>

              <div className="border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,16,26,0.88),rgba(9,12,19,0.98))] px-4 pb-1 pt-3 backdrop-blur-2xl">
                <div className="flex flex-wrap gap-2">
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
                </div>

                <button
                  type="button"
                  onClick={() => navigate(getCatalogRoute())}
                  className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[18px] bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] px-4 text-sm font-semibold text-slate-950 shadow-[0_14px_32px_rgba(214,186,131,0.22)] active:opacity-90"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ver catálogo completo
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
