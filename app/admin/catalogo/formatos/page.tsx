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
        eyebrow="Catálogo → Formatos"
        title="Formatos"
        description="Los formatos son el tipo de producto: Booster Pack, ETB (Elite Trainer Box), Bundle, Commander Deck, etc. Son independientes de la marca y se reutilizan en varias expansiones. Antes de crear un tipo de producto nuevo, aségrate de que el formato existe aquí."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">Formato guardado correctamente.</AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Añadir nuevo formato">
        <p className="mt-2 text-sm text-slate-400">
          Escribe el tipo de producto tal como aparece comercialmente. El identificador interno se genera solo.
        </p>
        <form action={saveAdminCatalogFormatAction} className="mt-5 grid gap-4 md:grid-cols-4">
          <AdminCatalogField
            label="Nombre del formato"
            name="label"
            placeholder="Ej: Booster Pack, ETB, Bundle"
            hint="El identificador interno se genera automáticamente."
          />
          <AdminCatalogField label="Posición en la lista" name="sortOrder" type="number" defaultValue="10" />
          <AdminCatalogCheckboxField label="Disponible para usar" name="active" defaultChecked />
          <div className="md:col-span-4">
            <Button type="submit">Añadir formato</Button>
          </div>
        </form>
      </AdminCatalogSection>

      {formats.length > 0 && (
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Formatos existentes ({formats.length})
          </p>
          {formats.map((format) => (
            <form
              key={format.id}
              action={saveAdminCatalogFormatAction}
              className="rounded-[28px] border border-white/10 bg-black/20 p-5"
            >
              <input type="hidden" name="id" value={format.id} />
              <div className="grid gap-4 md:grid-cols-4">
                <AdminCatalogField
                  label="Nombre del formato"
                  name="label"
                  defaultValue={format.label}
                  hint={`Identificador: ${format.slug}`}
                />
                <AdminCatalogField
                  label="Posición"
                  name="sortOrder"
                  type="number"
                  defaultValue={String(format.sortOrder)}
                />
                <AdminCatalogCheckboxField
                  label="Disponible"
                  name="active"
                  defaultChecked={format.active}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button type="submit" variant="outline">
                  Guardar cambios
                </Button>
              </div>
            </form>
          ))}
        </section>
      )}
    </div>
  );
}
