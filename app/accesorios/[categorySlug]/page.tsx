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
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getStoreCategoryByBrandAndSlug("accesorios", categorySlug);

  if (!category) {
    return {};
  }

  return buildPageMetadata({
    title: `Accesorios ${category.label}`,
    description: category.description,
    path: category.href,
    keywords: [
      `${category.label} tcg`,
      `accesorios ${category.label}`,
      "proteccion cartas",
    ],
  });
}

export default async function AccessoriesCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const [brand, category] = await Promise.all([
    getStoreBrandBySlug("accesorios"),
    getStoreCategoryByBrandAndSlug("accesorios", categorySlug),
  ]);

  if (!category) {
    notFound();
  }

  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
      accessoriesOnly: true,
      category: category.slug,
    }),
  );

  return (
    <ListingPage
      title={`Accesorios / ${category.label}`}
      description={category.description}
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Accesorios", href: "/accesorios" },
        { label: category.label },
      ]}
      brand={brand ?? undefined}
      resetHref={category.href}
    />
  );
}
