import { brandsBySlug } from "@/data/brands";
import type { BrandSlug, ProductCategorySlug } from "@/types/store";

import { normalizeSlug } from "@/lib/routes/slugs";

export function getCatalogRoute() {
  return "/catalogo";
}

export function getBrandRoute(brandSlug: BrandSlug) {
  if (brandSlug === "accesorios") {
    return "/accesorios";
  }

  if (brandSlug === "preventa") {
    return "/preventa";
  }

  return `/marca/${brandSlug}`;
}

export function getCategoryRoute(brandSlug: BrandSlug, categorySlug: ProductCategorySlug) {
  if (brandSlug === "accesorios") {
    return `/accesorios/${categorySlug}`;
  }

  if (brandSlug === "preventa") {
    return "/preventa";
  }

  return `/marca/${brandSlug}/${categorySlug}`;
}

export function getProductRoute(slug: string) {
  return `/producto/${normalizeSlug(slug)}`;
}

export function getBrandCategoryRoute(
  brandSlug: BrandSlug,
  categorySlug: ProductCategorySlug,
) {
  return getCategoryRoute(brandSlug, categorySlug);
}

export function getCategoryRouteFromData(
  brandSlug: BrandSlug,
  categorySlug: ProductCategorySlug,
) {
  const brand = brandsBySlug[brandSlug];

  if (!brand) {
    return getCategoryRoute(brandSlug, categorySlug);
  }

  const category = brand.categories.find((entry) => entry.slug === categorySlug);

  return category?.href ?? getCategoryRoute(brandSlug, categorySlug);
}
