import { ListingPage } from "@/components/store/listing-page";
import { brandsBySlug } from "@/data/brands";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";

export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  const brand = brandsBySlug.accesorios;
  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
      accessoriesOnly: true,
    }),
  );

  return (
    <ListingPage
      title="Accesorios"
      description={brand.description}
      eyebrow="Proteccion y setup"
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Accesorios" },
      ]}
      brand={brand}
      resetHref="/accesorios"
      categoryPills={brand.categories.map((category) => ({
        label: category.label,
        href: category.href,
      }))}
    />
  );
}
