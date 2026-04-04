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

type PublicFormatRow = Pick<
  Database["public"]["Tables"]["product_formats"]["Row"],
  "id" | "slug" | "label" | "sort_order" | "active"
>;

type PublicProductFormatRow = {
  brand_slug: string;
  format: PublicFormatRow | null;
};

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildBrandCategories(
  brandSlug: string,
  rows: PublicFormatRow[],
): BrandCategory[] {
  const preset = brandsBySlug[brandSlug];

  return rows.map((format) => {
    const presetCategory = preset?.categories.find((entry) => entry.slug === format.slug);

    return {
      id: format.id,
      slug: format.slug,
      label: format.label,
      description:
        presetCategory?.description ??
        `Explora ${format.label} en ${humanizeSlug(brandSlug)}.`,
      href: presetCategory?.href ?? getCategoryRoute(brandSlug, format.slug),
    };
  });
}

function buildBrandCategoriesFromProducts(
  products: PublicProductFormatRow[],
  brandSlug: string,
) {
  const seen = new Map<string, PublicFormatRow>();

  for (const product of products) {
    if (product.brand_slug !== brandSlug || !product.format?.active) {
      continue;
    }

    if (!seen.has(product.format.slug)) {
      seen.set(product.format.slug, product.format);
    }
  }

  return Array.from(seen.values())
    .sort((left, right) => left.sort_order - right.sort_order || left.label.localeCompare(right.label, "es"));
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

  const [{ data: brands, error: brandsError }, { data: products, error: productsError }] =
    await Promise.all([
      client
        .from("brands")
        .select("id, slug, label, active, sort_order")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      client
        .from("products")
        .select(`
          brand_slug,
          format:product_formats!products_format_id_fkey (
            id,
            slug,
            label,
            sort_order,
            active
          )
        `)
        .eq("active", true)
        .not("format_id", "is", null),
    ]);

  if (brandsError) {
    throw new Error(`[store-taxonomy] No se pudieron cargar las marcas: ${brandsError.message}`);
  }

  if (productsError) {
    throw new Error(
      `[store-taxonomy] No se pudieron cargar los formatos publicos: ${productsError.message}`,
    );
  }

  return {
    brands: (brands ?? []) as PublicBrandRow[],
    products: (products ?? []) as PublicProductFormatRow[],
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
    buildBrandCategoriesFromProducts(taxonomy.products, brandSlug),
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

  const category = buildBrandCategories(
    brandSlug,
    buildBrandCategoriesFromProducts(taxonomy.products, brandSlug),
  ).find((entry) => entry.slug === categorySlug);

  if (!category) {
    return null;
  }

  return category;
}
