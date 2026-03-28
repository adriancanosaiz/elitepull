import {
  AdminCatalogCheckboxField,
  AdminCatalogField,
  AdminCatalogNotice,
  AdminCatalogPageHeader,
  AdminCatalogSection,
} from "@/components/admin/catalog-master-fields";
import { saveAdminCatalogBrandAction } from "@/app/admin/catalogo/actions";
import { Button } from "@/components/ui/button";
import { getAdminCatalogBrands } from "@/lib/admin/catalog-taxonomy";

type BrandsPageSearchParams = Promise<{
  error?: string;
  success?: string;
}>;

export default async function AdminCatalogBrandsPage({
  searchParams,
}: {
  searchParams: BrandsPageSearchParams;
}) {
  const params = await searchParams;
  const brands = await getAdminCatalogBrands();

  return (
    <div className="space-y-6">
      <AdminCatalogPageHeader
        title="Marcas"
        description="Alta y edicion ligera de marcas para que el catalogo y el admin no dependan de listas fijas en frontend."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">Marca guardada correctamente.</AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Nueva marca">
        <form action={saveAdminCatalogBrandAction} className="mt-5 grid gap-4 md:grid-cols-4">
          <AdminCatalogField
            label="Label"
            name="label"
            placeholder="Pokemon"
            hint="El slug se genera automaticamente desde este nombre."
          />
          <AdminCatalogField label="Orden" name="sortOrder" type="number" defaultValue="10" />
          <AdminCatalogCheckboxField label="Activa" name="active" defaultChecked />
          <div className="md:col-span-4">
            <Button type="submit">Crear marca</Button>
          </div>
        </form>
      </AdminCatalogSection>

      <section className="space-y-4">
        {brands.map((brand) => (
          <form
            key={brand.id}
            action={saveAdminCatalogBrandAction}
            className="rounded-[28px] border border-white/10 bg-black/20 p-5"
          >
            <input type="hidden" name="id" value={brand.id} />
            <div className="grid gap-4 md:grid-cols-4">
              <AdminCatalogField
                label="Label"
                name="label"
                defaultValue={brand.label}
                hint={`Slug actual: ${brand.slug}`}
              />
              <AdminCatalogField
                label="Orden"
                name="sortOrder"
                type="number"
                defaultValue={String(brand.sortOrder)}
              />
              <AdminCatalogCheckboxField
                label="Activa"
                name="active"
                defaultChecked={brand.active}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="outline">
                Guardar marca
              </Button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
