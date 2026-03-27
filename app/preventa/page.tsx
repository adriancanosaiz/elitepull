import { ListingPage } from "@/components/store/listing-page";
import { brandsBySlug } from "@/data/brands";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";

export default async function PreorderPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  const brand = brandsBySlug.preventa;
  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
      preorderOnly: true,
    }),
  );

  return (
    <ListingPage
      title="Preventa"
      description={brand.description}
      eyebrow="Early access"
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Preventa" },
      ]}
      brand={brand}
      resetHref="/preventa"
      categoryPills={brand.categories.map((category) => ({
        label: category.label,
        href: category.href,
      }))}
    />
  );
}
