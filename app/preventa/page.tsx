import { ListingPage } from "@/components/store/listing-page";
import { brandsBySlug } from "@/data/brands";
import { getCollectionData } from "@/lib/repositories/store-repository";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import { buildPageMetadata } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Preventa TCG",
  description:
    "Reserva próximos lanzamientos de Pokemon, One Piece, Magic y Riftbound. Preventas destacadas con información clara y navegación rápida.",
  path: "/preventa",
  keywords: [
    "preventa tcg",
    "reservas pokemon",
    "reservas one piece tcg",
    "nuevos lanzamientos tcg",
  ],
});

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
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Preventa" },
      ]}
      brand={brand}
      resetHref="/preventa"
    />
  );
}
