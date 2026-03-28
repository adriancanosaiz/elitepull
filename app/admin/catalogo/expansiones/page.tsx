import { saveAdminCatalogExpansionAction } from "@/app/admin/catalogo/actions";
import {
  AdminCatalogCheckboxField,
  AdminCatalogField,
  AdminCatalogNotice,
  AdminCatalogPageHeader,
  AdminCatalogSection,
  AdminCatalogSelectField,
} from "@/components/admin/catalog-master-fields";
import { Button } from "@/components/ui/button";
import {
  getAdminCatalogBrands,
  getAdminCatalogExpansions,
} from "@/lib/admin/catalog-taxonomy";

type ExpansionsPageSearchParams = Promise<{
  error?: string;
  success?: string;
}>;

export default async function AdminCatalogExpansionsPage({
  searchParams,
}: {
  searchParams: ExpansionsPageSearchParams;
}) {
  const params = await searchParams;
  const [brands, expansions] = await Promise.all([
    getAdminCatalogBrands(),
    getAdminCatalogExpansions(),
  ]);

  return (
    <div className="space-y-6">
      <AdminCatalogPageHeader
        title="Expansiones"
        description="Cada expansion depende de una marca y luego alimenta las combinaciones validas de formato, idioma y variante."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">Expansion guardada correctamente.</AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Nueva expansion">
        <form action={saveAdminCatalogExpansionAction} className="mt-5 grid gap-4 md:grid-cols-5">
          <AdminCatalogSelectField
            label="Marca"
            name="brandId"
            options={brands.map((brand) => ({ value: brand.id, label: brand.label }))}
          />
          <AdminCatalogField
            label="Label"
            name="label"
            placeholder="Heroes Ascendentes"
            hint="El slug se genera automaticamente desde este nombre."
          />
          <AdminCatalogSelectField
            label="Estado"
            name="releaseStatus"
            options={[
              { value: "upcoming", label: "Proxima" },
              { value: "live", label: "Activa" },
              { value: "archived", label: "Archivada" },
            ]}
          />
          <AdminCatalogField label="Orden" name="sortOrder" type="number" defaultValue="10" />
          <div className="md:col-span-5 flex items-center justify-between gap-4">
            <AdminCatalogCheckboxField label="Activa" name="active" defaultChecked />
            <Button type="submit">Crear expansion</Button>
          </div>
        </form>
      </AdminCatalogSection>

      <section className="space-y-4">
        {expansions.map((expansion) => (
          <form
            key={expansion.id}
            action={saveAdminCatalogExpansionAction}
            className="rounded-[28px] border border-white/10 bg-black/20 p-5"
          >
            <input type="hidden" name="id" value={expansion.id} />
            <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-5">
              <AdminCatalogSelectField
                label="Marca"
                name="brandId"
                defaultValue={expansion.brandId}
                options={brands.map((brand) => ({ value: brand.id, label: brand.label }))}
              />
              <AdminCatalogField
                label="Label"
                name="label"
                defaultValue={expansion.label}
                hint={`Slug actual: ${expansion.slug}`}
              />
              <AdminCatalogSelectField
                label="Estado"
                name="releaseStatus"
                defaultValue={expansion.releaseStatus}
                options={[
                  { value: "upcoming", label: "Proxima" },
                  { value: "live", label: "Activa" },
                  { value: "archived", label: "Archivada" },
                ]}
              />
              <AdminCatalogField
                label="Orden"
                name="sortOrder"
                type="number"
                defaultValue={String(expansion.sortOrder)}
              />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-sm text-slate-400">
                {expansion.brandLabel} · {expansion.releaseStatus}
              </div>
              <div className="flex items-center gap-4">
                <AdminCatalogCheckboxField
                  label="Activa"
                  name="active"
                  defaultChecked={expansion.active}
                />
                <Button type="submit" variant="outline">
                  Guardar expansion
                </Button>
              </div>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
