import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingPage } from "@/components/store/listing-page";
import { getCollectionData } from "@/lib/repositories/store-repository";
import {
  getStoreBrandBySlug,
  getStoreCategoryByBrandAndSlug,
} from "@/lib/repositories/store-taxonomy-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import { buildPageMetadata } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandSlug: string; categorySlug: string }>;
}): Promise<Metadata> {
  const { brandSlug, categorySlug } = await params;
  const [brand, category] = await Promise.all([
    getStoreBrandBySlug(brandSlug),
    getStoreCategoryByBrandAndSlug(brandSlug, categorySlug),
  ]);

  if (!brand || !category || ["preventa"].includes(brandSlug)) {
    return {};
  }

  return buildPageMetadata({
    title: `${brand.shortName} ${category.label}`,
    description: category.description,
    path: category.href,
    keywords: [
      `${brand.shortName} ${category.label}`,
      `${brand.shortName} ${category.slug}`,
      `${category.label} tcg`,
    ],
  });
}

export default async function BrandCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandSlug: string; categorySlug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { brandSlug, categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const [brand, category] = await Promise.all([
    getStoreBrandBySlug(brandSlug),
    getStoreCategoryByBrandAndSlug(brandSlug, categorySlug),
  ]);

  if (!brand || !category || ["preventa"].includes(brandSlug)) {
    notFound();
  }

  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
      brand: brand.slug,
      category: category.slug,
    }),
  );

  return (
    <ListingPage
      title={`${brand.shortName} / ${category.label}`}
      description={category.description}
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Catalogo", href: "/catalogo" },
        { label: brand.shortName, href: brand.href },
        { label: category.label },
      ]}
      brand={brand}
      resetHref={category.href}
      heroVariant="logo-only"
    />
  );
}
