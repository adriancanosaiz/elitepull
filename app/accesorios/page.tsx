import { ListingPage } from "@/components/store/listing-page";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { getStoreBrandBySlug } from "@/lib/repositories/store-taxonomy-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import { buildPageMetadata } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Accesorios TCG",
  description:
    "Descubre fundas, deck boxes, binders, toploaders y accesorios para proteger y organizar tu colección TCG.",
  path: "/accesorios",
  keywords: [
    "accesorios tcg",
    "fundas cartas",
    "deck boxes",
    "binders cartas",
    "toploaders",
  ],
});

export default async function AccessoriesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  const brand = await getStoreBrandBySlug("accesorios");
  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
      accessoriesOnly: true,
    }),
  );

  return (
    <ListingPage
      title="Accesorios"
      description={brand?.description ?? "Accesorios para proteger y organizar tu coleccion TCG."}
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Accesorios" },
      ]}
      brand={brand ?? undefined}
      resetHref="/accesorios"
    />
  );
}
