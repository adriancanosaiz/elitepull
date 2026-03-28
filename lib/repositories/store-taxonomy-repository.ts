import { cache } from "react";

import { brandsBySlug } from "@/data/brands";
import {
  canUseMockFallbacks,
  formatSupabaseEnvErrorMessage,
  getSupabaseEnvStatus,
} from "@/lib/env";
import { getBrandRoute, getCategoryRoute } from "@/lib/routes/store-routes";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import type { Brand, BrandCategory, BrandTheme } from "@/types/store";

const DEFAULT_THEME: BrandTheme = {
  from: "from-primary/[0.15]",
  via: "via-white/5",
  to: "to-accent/[0.15]",
  glow: "shadow-glow",
};

type PublicBrandRow = Pick<
  Database["public"]["Tables"]["brands"]["Row"],
  "id" | "slug" | "label" | "active" | "sort_order"
>;

type PublicCategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "slug" | "label" | "description" | "brand_slug" | "sort_order" | "active"
>;

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildBrandCategories(
  brandSlug: string,
  rows: PublicCategoryRow[],
): BrandCategory[] {
  return rows.map((category) => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    description: category.description ?? `Explora ${category.label} en ${humanizeSlug(brandSlug)}.`,
    href: getCategoryRoute(brandSlug, category.slug),
  }));
}

function buildBrandPresentation(
  row: PublicBrandRow,
  categories: BrandCategory[],
): Brand {
  const preset = brandsBySlug[row.slug];

  return {
    id: row.slug,
    slug: row.slug,
    name: preset?.name ?? row.label,
    shortName: preset?.shortName ?? row.label,
    href: preset?.href ?? getBrandRoute(row.slug),
    tagline:
      preset?.tagline ??
      `${row.label} con producto fisico, lanzamientos y coleccionismo preparados para escalar.`,
    description:
      preset?.description ??
      `Explora el catalogo de ${row.label} con filtros por expansion, formato, idioma y preventa.`,
    spotlight:
      preset?.spotlight ?? "Expansiones, formatos e idiomas gestionados desde admin.",
    categories,
    theme: preset?.theme ?? DEFAULT_THEME,
  };
}

const getPublicTaxonomy = cache(async () => {
  const envStatus = getSupabaseEnvStatus();

  if (envStatus.kind !== "configured") {
    if (!canUseMockFallbacks()) {
      throw new Error(formatSupabaseEnvErrorMessage(envStatus));
    }

    return null;
  }

  const client = getSupabaseServerClient();

  if (!client) {
    return null;
  }

  const [{ data: brands, error: brandsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      client
        .from("brands")
        .select("id, slug, label, active, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      client
        .from("categories")
        .select("id, slug, label, description, brand_slug, sort_order, active")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
    ]);

  if (brandsError) {
    throw new Error(`[store-taxonomy] No se pudieron cargar las marcas: ${brandsError.message}`);
  }

  if (categoriesError) {
    throw new Error(
      `[store-taxonomy] No se pudieron cargar las categorias activas: ${categoriesError.message}`,
    );
  }

  return {
    brands: (brands ?? []) as PublicBrandRow[],
    categories: (categories ?? []) as PublicCategoryRow[],
  };
});

export async function getStoreBrandBySlug(brandSlug: string): Promise<Brand | null> {
  const taxonomy = await getPublicTaxonomy();

  if (!taxonomy) {
    return brandsBySlug[brandSlug] ?? null;
  }

  const brandRow = taxonomy.brands.find((brand) => brand.slug === brandSlug);

  if (!brandRow) {
    return null;
  }

  const categories = buildBrandCategories(
    brandSlug,
    taxonomy.categories.filter((category) => category.brand_slug === brandSlug),
  );

  return buildBrandPresentation(brandRow, categories);
}

export async function getStoreCategoryByBrandAndSlug(
  brandSlug: string,
  categorySlug: string,
): Promise<BrandCategory | null> {
  const taxonomy = await getPublicTaxonomy();

  if (!taxonomy) {
    const brand = brandsBySlug[brandSlug];
    return brand?.categories.find((category) => category.slug === categorySlug) ?? null;
  }

  const category = taxonomy.categories.find(
    (entry) => entry.brand_slug === brandSlug && entry.slug === categorySlug,
  );

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    slug: category.slug,
    label: category.label,
    description:
      category.description ?? `Explora ${category.label} dentro de ${humanizeSlug(brandSlug)}.`,
    href: getCategoryRoute(brandSlug, category.slug),
  };
}
