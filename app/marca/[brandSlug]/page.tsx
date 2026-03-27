import { notFound } from "next/navigation";

import { ListingPage } from "@/components/store/listing-page";
import { brandsBySlug } from "@/data/brands";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import { isBrandSlug } from "@/lib/catalog";
import type { SearchParamsInput } from "@/lib/routes/query-params";

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandSlug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { brandSlug } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isBrandSlug(brandSlug) || ["accesorios", "preventa"].includes(brandSlug)) {
    notFound();
  }

  const brand = brandsBySlug[brandSlug];
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
      eyebrow={`Marca / ${brand.shortName}`}
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Catalogo", href: "/catalogo" },
        { label: brand.shortName },
      ]}
      brand={brand}
      resetHref={brand.href}
      categoryPills={brand.categories.map((category) => ({
        label: category.label,
        href: category.href,
      }))}
    />
  );
}
