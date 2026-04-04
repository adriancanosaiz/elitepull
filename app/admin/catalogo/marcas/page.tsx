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
        eyebrow="Catálogo → Marcas"
        title="Marcas"
        description="Las marcas son los juegos que vendéis: Pokémon, One Piece, Magic, Lorcana… Añade aquí una nueva marca si empezáis a vender un juego nuevo. Todas las expansiones y productos dependen de la marca."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">Marca guardada correctamente.</AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Añadir nueva marca">
        <p className="mt-2 text-sm text-slate-400">
          Escribe el nombre del juego tal como quieres que aparezca. El identificador interno se genera solo.
        </p>
        <form action={saveAdminCatalogBrandAction} className="mt-5 grid gap-4 md:grid-cols-4">
          <AdminCatalogField
            label="Nombre de la marca"
            name="label"
            placeholder="Ej: Pokémon, One Piece, Magic"
            hint="El identificador interno se genera automáticamente a partir de este nombre."
          />
          <AdminCatalogField
            label="Posición en la lista"
            name="sortOrder"
            type="number"
            defaultValue="10"
            hint="Número menor = aparece antes. Usa 10, 20, 30… para dejar margen."
          />
          <AdminCatalogCheckboxField label="Mostrar en la tienda" name="active" defaultChecked />
          <div className="md:col-span-4">
            <Button type="submit">Añadir marca</Button>
          </div>
        </form>
      </AdminCatalogSection>

      {brands.length > 0 && (
        <section className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
            Marcas existentes ({brands.length})
          </p>
          {brands.map((brand) => (
            <form
              key={brand.id}
              action={saveAdminCatalogBrandAction}
              className="rounded-[28px] border border-white/10 bg-black/20 p-5"
            >
              <input type="hidden" name="id" value={brand.id} />
              <div className="grid gap-4 md:grid-cols-4">
                <AdminCatalogField
                  label="Nombre de la marca"
                  name="label"
                  defaultValue={brand.label}
                  hint={`Identificador interno: ${brand.slug}`}
                />
                <AdminCatalogField
                  label="Posición"
                  name="sortOrder"
                  type="number"
                  defaultValue={String(brand.sortOrder)}
                />
                <AdminCatalogCheckboxField
                  label="Mostrar en la tienda"
                  name="active"
                  defaultChecked={brand.active}
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
