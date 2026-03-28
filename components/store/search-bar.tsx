"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";

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

  const results = resolveSearchResults(query).slice(0, compact ? 5 : 6);

  function navigateTo(href: string) {
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
    <div className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-3 rounded-[22px] border border-primary/15 bg-[linear-gradient(180deg,rgba(18,22,32,0.92),rgba(10,13,20,0.85))] px-4 py-3 text-sm text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-colors hover:border-primary/25 hover:bg-[linear-gradient(180deg,rgba(20,24,36,0.96),rgba(12,15,22,0.9))]",
          compact ? "h-11 px-3 py-2" : "h-12",
        )}
      >
        <Search aria-hidden className="pointer-events-none h-4 w-4 shrink-0 text-primary/80" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
    </div>
  );
}
