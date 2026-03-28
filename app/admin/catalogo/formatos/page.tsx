import {
  AdminCatalogCheckboxField,
  AdminCatalogField,
  AdminCatalogNotice,
  AdminCatalogPageHeader,
  AdminCatalogSection,
} from "@/components/admin/catalog-master-fields";
import { saveAdminCatalogFormatAction } from "@/app/admin/catalogo/actions";
import { Button } from "@/components/ui/button";
import { getAdminCatalogFormats } from "@/lib/admin/catalog-taxonomy";

type FormatsPageSearchParams = Promise<{
  error?: string;
  success?: string;
}>;

export default async function AdminCatalogFormatsPage({
  searchParams,
}: {
  searchParams: FormatsPageSearchParams;
}) {
  const params = await searchParams;
  const formats = await getAdminCatalogFormats();

  return (
    <div className="space-y-6">
      <AdminCatalogPageHeader
        title="Formatos"
        description="Define los formatos reutilizables del catalogo, independientemente de la marca o expansion donde se utilicen."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">Formato guardado correctamente.</AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Nuevo formato">
        <form action={saveAdminCatalogFormatAction} className="mt-5 grid gap-4 md:grid-cols-4">
          <AdminCatalogField
            label="Label"
            name="label"
            placeholder="Collector Booster Packs"
            hint="El slug se genera automaticamente desde este nombre."
          />
          <AdminCatalogField label="Orden" name="sortOrder" type="number" defaultValue="10" />
          <AdminCatalogCheckboxField label="Activo" name="active" defaultChecked />
          <div className="md:col-span-4">
            <Button type="submit">Crear formato</Button>
          </div>
        </form>
      </AdminCatalogSection>

      <section className="space-y-4">
        {formats.map((format) => (
          <form
            key={format.id}
            action={saveAdminCatalogFormatAction}
            className="rounded-[28px] border border-white/10 bg-black/20 p-5"
          >
            <input type="hidden" name="id" value={format.id} />
            <div className="grid gap-4 md:grid-cols-4">
              <AdminCatalogField
                label="Label"
                name="label"
                defaultValue={format.label}
                hint={`Slug actual: ${format.slug}`}
              />
              <AdminCatalogField
                label="Orden"
                name="sortOrder"
                type="number"
                defaultValue={String(format.sortOrder)}
              />
              <AdminCatalogCheckboxField
                label="Activo"
                name="active"
                defaultChecked={format.active}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" variant="outline">
                Guardar formato
              </Button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
