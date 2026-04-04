import {
  AdminCatalogNotice,
  AdminCatalogPageHeader,
} from "@/components/admin/catalog-master-fields";
import {
  getAdminCatalogAvailability,
  getAdminCatalogBrands,
  getAdminCatalogExpansions,
  getAdminCatalogFormats,
  getAdminCatalogLanguages,
} from "@/lib/admin/catalog-taxonomy";
import { CatalogAvailabilityManager } from "@/components/admin/catalog-availability-manager";

type CatalogConfigurationPageSearchParams = Promise<{
  error?: string;
  success?: string;
}>;

export default async function AdminCatalogConfigurationPage({
  searchParams,
}: {
  searchParams: CatalogConfigurationPageSearchParams;
}) {
  const params = await searchParams;
  const [brands, expansions, formats, languages, availabilities] = await Promise.all([
    getAdminCatalogBrands(),
    getAdminCatalogExpansions(),
    getAdminCatalogFormats(),
    getAdminCatalogLanguages(),
    getAdminCatalogAvailability(),
  ]);

  return (
    <div className="space-y-6">
      <AdminCatalogPageHeader
        title="Disponibilidad de Formatos"
        description="Aquí decides qué formatos e idiomas se van a vender para cada expansión. Es el primer paso vital antes de crear los productos para venta."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">
          Operación realizada correctamente.
        </AdminCatalogNotice>
      ) : null}

      <CatalogAvailabilityManager
        brands={brands}
        expansions={expansions}
        formats={formats}
        languages={languages}
        availabilities={availabilities}
      />
    </div>
  );
}
