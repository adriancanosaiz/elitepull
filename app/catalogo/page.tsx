import { ListingPage } from "@/components/store/listing-page";
import { brands } from "@/data/brands";
import { buildCollectionRepositoryInput } from "@/lib/routes/collection-input";
import { getCollectionData } from "@/lib/repositories/store-repository";
import type { SearchParamsInput } from "@/lib/routes/query-params";

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
      description="Vista global para explorar sellado, singles, accesorios y preventa con filtros visuales y una presentacion limpia, premium y preparada para backend."
      eyebrow="Coleccion reusable"
      collection={collection}
      breadcrumbs={[
        { label: "Inicio", href: "/" },
        { label: "Catalogo" },
      ]}
      resetHref="/catalogo"
      categoryPills={brands.map((brand) => ({
        label: brand.shortName,
        href: brand.href,
      }))}
    />
  );
}
