import { notFound } from "next/navigation";

import { ListingPage } from "@/components/store/listing-page";
import { brandsBySlug } from "@/data/brands";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";

export default async function AccessoriesCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<SearchParamsInput>;
}) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const brand = brandsBySlug.accesorios;
  const category = brand.categories.find((entry) => entry.slug === categorySlug);

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
      eyebrow="Accesorio destacado"
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Accesorios", href: "/accesorios" },
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
