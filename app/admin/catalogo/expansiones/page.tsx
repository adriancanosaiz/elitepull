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
        eyebrow="Catálogo → Expansiones"
        title="Expansiones"
        description="Las expansiones son los sets o ediciones dentro de cada marca. Por ejemplo, Scarlet & Violet es una expansión de Pokémon; OP09 es una expansión de One Piece. Sin expansión no se pueden crear productos."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">Expansión guardada correctamente.</AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Añadir nueva expansión">
        <p className="mt-2 text-sm text-slate-400">
          Primero elige la marca a la que pertenece y luego escribe el nombre de la expansión.
        </p>
        <form action={saveAdminCatalogExpansionAction} className="mt-5 grid gap-4 md:grid-cols-5">
          <AdminCatalogSelectField
            label="Marca"
            name="brandId"
            options={brands.map((brand) => ({ value: brand.id, label: brand.label }))}
          />
          <AdminCatalogField
            label="Nombre de la expansión"
            name="label"
            placeholder="Ej: Scarlet & Violet, OP09"
            hint="El identificador interno se genera automáticamente."
          />
          <AdminCatalogSelectField
            label="Estado"
            name="releaseStatus"
            options={[
              { value: "upcoming", label: "Próxima — aún no disponible" },
              { value: "live", label: "Disponible — a la venta" },
              { value: "archived", label: "Archivada — ya no se vende" },
            ]}
          />
          <AdminCatalogField
            label="Posición en la lista"
            name="sortOrder"
            type="number"
            defaultValue="10"
          />
          <div className="md:col-span-5 flex items-center justify-between gap-4">
            <AdminCatalogCheckboxField label="Disponible para crear productos" name="active" defaultChecked />
            <Button type="submit">Añadir expansión</Button>
          </div>
        </form>
      </AdminCatalogSection>

      {expansions.length > 0 && (
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Expansiones existentes ({expansions.length})
          </p>
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
                  label="Nombre"
                  name="label"
                  defaultValue={expansion.label}
                  hint={`Identificador: ${expansion.slug}`}
                />
                <AdminCatalogSelectField
                  label="Estado"
                  name="releaseStatus"
                  defaultValue={expansion.releaseStatus}
                  options={[
                    { value: "upcoming", label: "Próxima" },
                    { value: "live", label: "Disponible" },
                    { value: "archived", label: "Archivada" },
                  ]}
                />
                <AdminCatalogField
                  label="Posición"
                  name="sortOrder"
                  type="number"
                  defaultValue={String(expansion.sortOrder)}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  {expansion.brandLabel} · {expansion.releaseStatus}
                </div>
                <div className="flex items-center gap-4">
                  <AdminCatalogCheckboxField
                    label="Disponible"
                    name="active"
                    defaultChecked={expansion.active}
                  />
                  <Button type="submit" variant="outline">
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </form>
          ))}
        </section>
      )}
    </div>
  );
}
