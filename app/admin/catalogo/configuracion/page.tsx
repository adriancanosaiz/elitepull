import {
  AdminCatalogCheckboxField,
  AdminCatalogField,
  AdminCatalogNotice,
  AdminCatalogPageHeader,
  AdminCatalogSection,
  AdminCatalogSelectField,
} from "@/components/admin/catalog-master-fields";
import {
  saveAdminCatalogAvailabilityAction,
  saveAdminCatalogAvailabilityBatchAction,
} from "@/app/admin/catalogo/actions";
import { Button } from "@/components/ui/button";
import {
  getAdminCatalogAvailability,
  getAdminCatalogExpansions,
  getAdminCatalogFormats,
  getAdminCatalogLanguages,
} from "@/lib/admin/catalog-taxonomy";

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
  const [expansions, formats, languages, availabilities] = await Promise.all([
    getAdminCatalogExpansions(),
    getAdminCatalogFormats(),
    getAdminCatalogLanguages(),
    getAdminCatalogAvailability(),
  ]);

  const activeExpansions = expansions.filter((expansion) => expansion.active);
  const activeFormats = formats.filter((format) => format.active);
  const activeLanguages = languages.filter((language) => language.active);

  const expansionOptions = expansions.map((expansion) => ({
    value: expansion.id,
    label: `${expansion.brandLabel} · ${expansion.label}`,
  }));
  const createExpansionOptions = activeExpansions.map((expansion) => ({
    value: expansion.id,
    label: `${expansion.brandLabel} · ${expansion.label}`,
  }));
  const formatOptions = formats.map((format) => ({
    value: format.id,
    label: format.label,
  }));
  const languageOptions = languages.map((language) => ({
    value: language.code,
    label: language.label,
  }));

  return (
    <div className="space-y-6">
      <AdminCatalogPageHeader
        title="Configuracion del catalogo"
        description="Aqui defines las combinaciones validas de expansion, formato, idioma y variante que luego podran usarse al crear productos reales."
      />

      {params.error ? <AdminCatalogNotice tone="error">{params.error}</AdminCatalogNotice> : null}
      {params.success ? (
        <AdminCatalogNotice tone="success">
          Configuracion guardada correctamente.
        </AdminCatalogNotice>
      ) : null}

      <AdminCatalogSection eyebrow="Alta masiva">
        <form
          action={saveAdminCatalogAvailabilityBatchAction}
          className="mt-5 space-y-5"
        >
          <div className="grid gap-4 xl:grid-cols-4">
            <AdminCatalogSelectField
              label="Expansion"
              name="expansionId"
              options={createExpansionOptions}
            />
            <AdminCatalogField
              label="Variante"
              name="variantLabel"
              placeholder="Jinx"
              hint="Opcional. Se aplicara a todas las combinaciones creadas en este envio."
            />
            <AdminCatalogField label="Orden inicial" name="sortOrder" type="number" defaultValue="10" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <AdminCatalogCheckboxField label="Activa" name="active" defaultChecked />
              <AdminCatalogCheckboxField label="Preventa por defecto" name="isPreorderDefault" />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Formatos e idiomas
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Marca uno o varios formatos. Dentro de cada formato, selecciona uno o varios idiomas.
              Se creara una configuracion por cada combinacion formato + idioma.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {activeFormats.map((format) => (
                <div
                  key={format.id}
                  className="rounded-[22px] border border-white/10 bg-black/20 p-4"
                >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="selectedFormatIds"
                      value={format.id}
                      className="h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--color-primary)]"
                    />
                    <span className="text-sm font-semibold text-white">{format.label}</span>
                  </label>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeLanguages.map((language) => (
                      <label
                        key={`${format.id}-${language.code}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-200"
                      >
                        <input
                          type="checkbox"
                          name={`languages::${format.id}`}
                          value={language.code}
                          className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-[var(--color-primary)]"
                        />
                        <span>{language.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Button type="submit">Crear configuraciones</Button>
          </div>
        </form>
      </AdminCatalogSection>

      <AdminCatalogSection eyebrow="Edicion individual">
        <p className="mt-4 text-sm leading-7 text-slate-300">
          Usa la edicion individual para ajustar una combinacion concreta, activar o desactivar una
          fila, cambiar el orden o editar variantes ya creadas.
        </p>
      </AdminCatalogSection>

      <section className="space-y-4">
        {availabilities.map((availability) => (
          <form
            key={availability.id}
            action={saveAdminCatalogAvailabilityAction}
            className="rounded-[28px] border border-white/10 bg-black/20 p-5"
          >
            <input type="hidden" name="id" value={availability.id} />

            <div className="grid gap-4 xl:grid-cols-6">
              <AdminCatalogSelectField
                label="Expansion"
                name="expansionId"
                defaultValue={availability.expansionId}
                options={expansionOptions}
              />
              <AdminCatalogSelectField
                label="Formato"
                name="formatId"
                defaultValue={availability.formatId}
                options={formatOptions}
              />
              <AdminCatalogSelectField
                label="Idioma"
                name="languageCode"
                defaultValue={availability.languageCode}
                options={languageOptions}
              />
              <AdminCatalogField
                label="Variante"
                name="variantLabel"
                defaultValue={availability.variantLabel ?? ""}
                placeholder="Sin variante"
              />
              <AdminCatalogField
                label="Orden"
                name="sortOrder"
                type="number"
                defaultValue={String(availability.sortOrder)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminCatalogCheckboxField
                  label="Activa"
                  name="active"
                  defaultChecked={availability.active}
                />
                <AdminCatalogCheckboxField
                  label="Preventa por defecto"
                  name="isPreorderDefault"
                  defaultChecked={availability.isPreorderDefault}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-400">
                {availability.brandLabel} · {availability.expansionLabel} · {availability.formatLabel}
                {" · "}
                {availability.languageCode}
                {availability.variantLabel ? ` · ${availability.variantLabel}` : ""}
              </div>
              <Button type="submit" variant="outline">
                Guardar configuracion
              </Button>
            </div>
          </form>
        ))}
      </section>
    </div>
  );
}
