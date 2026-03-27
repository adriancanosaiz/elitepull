"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

import { BrandGlyph } from "@/components/store/brand-glyph";
import { brands } from "@/data/brands";
import { searchSuggestions } from "@/data/site";
import { buildCollectionQueryString } from "@/lib/routes/query-params";
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
  kind: "brand" | "category" | "curated";
};

const curatedTargets: SearchTarget[] = [
  {
    id: "curated-sellado",
    label: "Sellado destacado",
    description: "ETB, cajas y boosters con foco premium.",
    href: `/catalogo?${buildCollectionQueryString({ featured: true })}`,
    keywords: ["sellado", "sealed", "etb", "booster", "caja", "display"],
    kind: "curated",
  },
  {
    id: "curated-singles",
    label: "Cartas individuales",
    description: "Singles chase, alt arts y piezas raras.",
    href: `/catalogo?${buildCollectionQueryString({ category: ["cartas-individuales"] })}`,
    keywords: ["single", "singles", "charizard", "luffy", "carta", "alt art"],
    kind: "curated",
  },
  {
    id: "curated-preventa",
    label: "Preventa activa",
    description: "Lanzamientos y reservas abiertas.",
    href: "/preventa",
    keywords: ["preventa", "reserva", "preorder", "proximo lanzamiento"],
    kind: "curated",
  },
];

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
  ...curatedTargets,
];

function normalizeSearchText(value: string) {
  return normalizeSlug(value).replace(/-/g, " ");
}

function resolveSearchResults(query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [
      ...searchTargets.filter((target) => target.kind === "brand").slice(0, 4),
      ...curatedTargets.slice(0, 2),
    ];
  }

  return searchTargets.filter((target) => {
    const haystack = normalizeSearchText(
      [target.label, target.description, ...target.keywords].join(" "),
    );

    return haystack.includes(normalizedQuery);
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = resolveSearchResults(query).slice(0, compact ? 5 : 6);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function navigateTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (results[0]) {
      navigateTo(results[0].href);
      return;
    }

    navigateTo(getCatalogRoute());
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-3 rounded-[22px] border border-primary/15 bg-[linear-gradient(180deg,rgba(18,22,32,0.92),rgba(10,13,20,0.85))] px-4 py-3 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors hover:border-primary/25 hover:bg-[linear-gradient(180deg,rgba(20,24,36,0.96),rgba(12,15,22,0.9))] focus-within:border-primary/28 focus-within:bg-[linear-gradient(180deg,rgba(20,24,36,0.98),rgba(11,14,21,0.94))]",
          compact ? "h-11 px-3 py-2" : "h-12",
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-primary/80" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
          placeholder={`Busca ${searchSuggestions[0]}, ETB, collector booster...`}
          aria-label="Buscar en la tienda"
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

      {open ? (
        <div className="absolute inset-x-0 top-[calc(100%+0.85rem)] z-50 overflow-hidden rounded-[24px] border border-primary/14 bg-[linear-gradient(180deg,rgba(14,18,28,0.98),rgba(8,11,18,0.98))] shadow-[0_28px_70px_rgba(2,6,23,0.5)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="p-3">
            <div className="mb-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
              {query.trim() ? "Resultados rapidos" : "Atajos de navegacion"}
            </div>

            <div className="space-y-2">
              {results.length > 0 ? (
                results.map((target) => (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => navigateTo(target.href)}
                    className="flex w-full items-center gap-3 rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-left transition-colors hover:border-primary/20 hover:bg-white/[0.05]"
                  >
                    {target.brand ? <BrandGlyph brand={target.brand} size="sm" /> : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{target.label}</p>
                      <p className="mt-1 truncate text-xs leading-5 text-slate-300/85">
                        {target.description}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                      {target.kind}
                    </span>
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo(getCatalogRoute())}
                  className="flex w-full items-center justify-between rounded-[18px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-left transition-colors hover:border-primary/20 hover:bg-white/[0.05]"
                >
                  <div>
                    <p className="text-sm font-medium text-white">Ir al catalogo completo</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300/85">
                      No hay coincidencias exactas, pero puedes seguir explorando desde la
                      coleccion general.
                    </p>
                  </div>
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                    catalogo
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
