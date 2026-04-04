"use client";

import { useMemo, useState } from "react";
import { Filter, Trash2, SlidersHorizontal, Check } from "lucide-react";

import {
  AdminCatalogCheckboxField,
  AdminCatalogField,
  AdminCatalogSelectField,
} from "@/components/admin/catalog-master-fields";
import { Button } from "@/components/ui/button";
import {
  deleteAdminCatalogAvailabilityAction,
  saveAdminCatalogAvailabilityAction,
  saveAdminCatalogAvailabilityBatchAction,
} from "@/app/admin/catalogo/actions";
import type {
  AdminCatalogAvailability,
  AdminCatalogBrand,
  AdminCatalogExpansion,
  AdminCatalogFormat,
  AdminCatalogLanguage,
} from "@/lib/admin/catalog-taxonomy";

export function CatalogAvailabilityManager({
  brands,
  expansions,
  formats,
  languages,
  availabilities,
}: {
  brands: AdminCatalogBrand[];
  expansions: AdminCatalogExpansion[];
  formats: AdminCatalogFormat[];
  languages: AdminCatalogLanguage[];
  availabilities: AdminCatalogAvailability[];
}) {
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedExpansionId, setSelectedExpansionId] = useState("");

  const activeBrands = useMemo(() => brands.filter((b) => b.active), [brands]);
  const relevantExpansions = useMemo(
    () => expansions.filter((e) => e.brandId === selectedBrandId && e.active),
    [expansions, selectedBrandId],
  );

  const activeFormats = useMemo(() => formats.filter((f) => f.active), [formats]);
  const activeLanguages = useMemo(() => languages.filter((l) => l.active), [languages]);

  const filteredAvailabilities = useMemo(
    () => availabilities.filter((a) => a.expansionId === selectedExpansionId),
    [availabilities, selectedExpansionId],
  );

  const formatOptions = useMemo(
    () => formats.map((format) => ({ value: format.id, label: format.label })),
    [formats],
  );
  const languageOptions = useMemo(
    () => languages.map((l) => ({ value: l.code, label: l.label })),
    [languages],
  );

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrandId(e.target.value);
    setSelectedExpansionId("");
  };

  return (
    <div className="space-y-6">
      {/* 1. Selector Contextual */}
      <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Filtro de contexto</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Paso 1: Marca
            </span>
            <select
              value={selectedBrandId}
              onChange={handleBrandChange}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none"
            >
              <option value="">-- Selecciona una marca --</option>
              {activeBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              Paso 2: Expansión
            </span>
            <select
              value={selectedExpansionId}
              onChange={(e) => setSelectedExpansionId(e.target.value)}
              disabled={!selectedBrandId}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none disabled:opacity-50"
            >
              <option value="">-- Selecciona una expansión --</option>
              {relevantExpansions.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {!selectedExpansionId ? (
        <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-white/10 p-10 text-center">
          <SlidersHorizontal className="h-8 w-8 text-slate-600 mb-4" />
          <p className="text-sm text-slate-400">
            Selecciona una marca y una expansión arriba para configurar la disponibilidad de venta.
          </p>
        </div>
      ) : (
        <>
          {/* Matriz de Selección Múltiple */}
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <h3 className="mb-1 text-base font-semibold text-white">Generación Rápida</h3>
            <p className="text-xs text-slate-400 mb-5">
              Marca los formatos y en qué idiomas están disponibles para crearlos de una vez.
            </p>

            <form action={saveAdminCatalogAvailabilityBatchAction} className="space-y-5">
              <input type="hidden" name="expansionId" value={selectedExpansionId} />
              <input type="hidden" name="active" value="on" />
              <input type="hidden" name="sortOrder" value="10" />

              <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
                {activeFormats.map((format) => (
                  <div key={format.id} className="rounded-[20px] border border-white/8 bg-white/[0.02] p-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="selectedFormatIds"
                        value={format.id}
                        className="h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--color-primary)]"
                      />
                      <span className="text-sm font-semibold text-white">{format.label}</span>
                    </label>

                    <div className="mt-4 flex flex-wrap gap-2 pl-7">
                      {activeLanguages.map((language) => (
                        <label
                          key={`${format.id}-${language.code}`}
                          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 transition-colors hover:bg-white/[0.08]"
                        >
                          <input
                            type="checkbox"
                            name={`languages::${format.id}`}
                            value={language.code}
                            className="peer h-3 w-3 rounded border-white/20 bg-transparent accent-[var(--color-primary)]"
                          />
                          <span className="peer-checked:text-primary">{language.code}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" className="gap-2">
                  <Check className="h-4 w-4" />
                  Crear combinaciones marcadas
                </Button>
              </div>
            </form>
          </div>

          {/* Listado de combinaciones actuales para ESTA expansión */}
          <div className="space-y-4">
            <h3 className="mb-2 px-1 text-sm font-semibold text-white flex items-center justify-between">
              <span>Disponibilidades creadas ({filteredAvailabilities.length})</span>
            </h3>

            {filteredAvailabilities.length === 0 ? (
              <p className="px-1 text-sm text-slate-500">No hay configuraciones dadas de alta.</p>
            ) : (
              filteredAvailabilities.map((availability) => (
                <div
                  key={availability.id}
                  className="rounded-[22px] border border-white/10 bg-black/20 p-5 group flex flex-col gap-4"
                >
                  <form action={saveAdminCatalogAvailabilityAction} className="flex-1">
                    <input type="hidden" name="id" value={availability.id} />
                    <input type="hidden" name="expansionId" value={availability.expansionId} />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
                      <div className="flex flex-col justify-end">
                        <AdminCatalogCheckboxField
                          label="Activa"
                          name="active"
                          defaultChecked={availability.active}
                        />
                      </div>
                      <div className="flex items-end justify-end">
                        <Button type="submit" variant="outline" className="w-full text-xs">
                          Actualizar
                        </Button>
                      </div>
                    </div>
                  </form>

                  {/* Fila separada para borrar (requiere su propio form / action) */}
                  <form
                    action={deleteAdminCatalogAvailabilityAction}
                    className="flex justify-end border-t border-white/[0.06] pt-3"
                  >
                    <input type="hidden" name="id" value={availability.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 opacity-60 transition-opacity hover:opacity-100 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar permanentemente
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
