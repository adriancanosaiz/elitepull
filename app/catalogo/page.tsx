import { ListingPage } from "@/components/store/listing-page";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import { getCollectionData } from "@/lib/repositories/store-repository";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import { buildPageMetadata } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Catalogo TCG",
  description:
    "Explora el catálogo completo de ElitePull con sellado, singles, accesorios y preventas de Pokemon, One Piece, Magic y Riftbound.",
  path: "/catalogo",
  keywords: [
    "catalogo tcg",
    "comprar cartas pokemon",
    "comprar one piece tcg",
    "magic sellado",
    "tienda de cartas coleccionables",
  ],
});

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}) {
  const resolvedSearchParams = await searchParams;
  const collection = await getCollectionData(
    buildCollectionRepositoryInput({
      searchParams: resolvedSearchParams,
    }),
  );

  return (
    <ListingPage
      title="Catalogo completo"
      description="Todo el catálogo de ElitePull en una sola vista: sellado, singles, accesorios y preventas con filtros claros y navegación rápida."
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Catalogo" },
      ]}
      resetHref="/catalogo"
    />
  );
}
