import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ListingPage } from "@/components/store/listing-page";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { getStoreBrandBySlug } from "@/lib/repositories/store-taxonomy-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import { buildPageMetadata } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brandSlug: string }>;
}): Promise<Metadata> {
  const { brandSlug } = await params;
  const brand = await getStoreBrandBySlug(brandSlug);

  if (!brand || ["preventa"].includes(brandSlug)) {
    return {};
  }

  return buildPageMetadata({
    title: `${brand.name} TCG`,
    description: brand.description,
    path: brand.href,
    keywords: [
      `${brand.shortName} tcg`,
      `${brand.shortName} cartas`,
      `${brand.shortName} sellado`,
      `${brand.shortName} coleccion`,
    ],
  });
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandSlug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { brandSlug } = await params;
  const resolvedSearchParams = await searchParams;
  const brand = await getStoreBrandBySlug(brandSlug);

  if (!brand || ["preventa"].includes(brandSlug)) {
    notFound();
  }
  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
      brand: brand.slug,
    }),
  );

  return (
    <ListingPage
      title={brand.name}
      description={brand.description}
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Catalogo", href: "/catalogo" },
        { label: brand.shortName },
      ]}
      brand={brand}
      resetHref={brand.href}
      heroVariant="logo-only"
    />
  );
}
