import { notFound } from "next/navigation";

import { ListingPage } from "@/components/store/listing-page";
import { brandsBySlug } from "@/data/brands";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import { getCategoryLabel, isBrandSlug } from "@/lib/catalog";
import type { SearchParamsInput } from "@/lib/routes/query-params";

export default async function BrandCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ brandSlug: string; categorySlug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { brandSlug, categorySlug } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isBrandSlug(brandSlug) || ["accesorios", "preventa"].includes(brandSlug)) {
    notFound();
  }

  const brand = brandsBySlug[brandSlug];
  const category = brand.categories.find((entry) => entry.slug === categorySlug);

  if (!category) {
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
      eyebrow={`Categoria / ${getCategoryLabel(category.slug)}`}
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Catalogo", href: "/catalogo" },
        { label: brand.shortName, href: brand.href },
        { label: category.label },
      ]}
      brand={brand}
      resetHref={category.href}
      categoryPills={brand.categories.map((entry) => ({
        label: entry.label,
        href: entry.href,
        active: entry.slug === category.slug,
      }))}
    />
  );
}
