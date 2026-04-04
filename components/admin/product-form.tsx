"use client";

import type {
  ChangeEvent,
  ComponentProps,
  ComponentPropsWithoutRef,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  buildGeneratedProductSku,
  buildGeneratedProductSlug,
} from "@/lib/admin/catalog-identifiers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductDetail } from "@/lib/admin/products";
import type {
  AdminProductCatalogOptions,
} from "@/lib/admin/catalog-taxonomy";
import type { ProductLanguage } from "@/types/store";

const selectClassName =
  "flex h-11 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/90 [color-scheme:dark] px-4 pr-11 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-200 focus-visible:border-primary/40 focus-visible:bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const selectOptionClassName = "bg-slate-950 text-white";

const textareaClassName =
  "flex min-h-[140px] w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const fileInputClassName =
  "block w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white";

type ProductFormValues = {
  id?: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  productType: "sealed" | "single" | "accessory";
  brandId: string;
  expansionId: string;
  formatId: string;
  languageCode: ProductLanguage;
  variantLabel: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isPreorder: boolean;
  tags: string[];
  attributes: {
    rarity: string;
    condition?: "NM" | "EX" | "LP" | "GD";
    badge: string;
  };
  coverImagePath: string;
  galleryImagePaths: string[];
};

function getDefaultBrandId(catalogOptions: AdminProductCatalogOptions) {
  return catalogOptions.brands.find((brand) => brand.active)?.id ?? catalogOptions.brands[0]?.id ?? "";
}

function buildInitialValues(
  product: AdminProductDetail | null | undefined,
  catalogOptions: AdminProductCatalogOptions,
): ProductFormValues {
  if (!product) {
    return {
      id: undefined,
      slug: "",
      sku: "",
      name: "",
      description: "",
      productType: "sealed",
      brandId: getDefaultBrandId(catalogOptions),
      expansionId: "",
      formatId: "",
      languageCode: "ES",
      variantLabel: "",
      price: 0,
      compareAtPrice: undefined,
      stock: 0,
      active: true,
      featured: false,
      isPreorder: false,
      tags: [],
      attributes: {
        rarity: "",
        condition: undefined,
        badge: "",
      },
      coverImagePath: "",
      galleryImagePaths: [],
    };
  }

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    productType: product.productType,
    brandId: product.brandId,
    expansionId: product.expansionId,
    formatId: product.formatId,
    languageCode: product.languageCode,
    variantLabel: product.variantLabel ?? "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    active: product.active,
    featured: product.featured,
    isPreorder: product.isPreorder,
    tags: product.tags,
    attributes: {
      rarity: product.attributes.rarity ?? "",
      condition: product.attributes.condition,
      badge: product.attributes.badge ?? "",
    },
    coverImagePath: product.coverImagePath ?? "",
    galleryImagePaths: product.galleryImagePaths,
  };
}

function getBrandLabel(
  catalogOptions: AdminProductCatalogOptions,
  brandId: string,
) {
  return catalogOptions.brands.find((brand) => brand.id === brandId)?.label ?? "la marca";
}

function getVariantOptions(
  catalogOptions: AdminProductCatalogOptions,
  expansionId: string,
  formatId: string,
  languageCode: ProductLanguage,
) {
  const matchingAvailabilities = catalogOptions.availabilities.filter(
    (availability) =>
      availability.expansionId === expansionId &&
      availability.formatId === formatId &&
      availability.languageCode === languageCode,
  );

  const variantValues = Array.from(
    new Set(
      matchingAvailabilities
        .map((availability) => availability.variantLabel?.trim() ?? "")
        .filter((value, index, values) => values.indexOf(value) === index),
    ),
  );

  return variantValues;
}

function getGeneratedProductIdentifiers(input: {
  catalogOptions: AdminProductCatalogOptions;
  brandId: string;
  expansionId: string;
  formatId: string;
  languageCode: ProductLanguage;
  variantLabel: string;
  name: string;
}) {
  const brand = input.catalogOptions.brands.find((entry) => entry.id === input.brandId);
  const expansion = input.catalogOptions.expansions.find((entry) => entry.id === input.expansionId);
  const format = input.catalogOptions.formats.find((entry) => entry.id === input.formatId);

  if (!brand || !expansion || !format || !input.name.trim()) {
    return {
      slug: "",
      sku: "",
    };
  }

  return {
    slug: buildGeneratedProductSlug({
      brandSlug: brand.slug,
      expansionSlug: expansion.slug,
      formatSlug: format.slug,
      languageCode: input.languageCode,
      variantLabel: input.variantLabel,
      name: input.name,
    }),
    sku: buildGeneratedProductSku({
      brandSlug: brand.slug,
      expansionSlug: expansion.slug,
      formatSlug: format.slug,
      languageCode: input.languageCode,
      variantLabel: input.variantLabel,
      name: input.name,
    }),
  };
}

function matchesInitialAvailabilitySelection(
  availability: AdminProductCatalogOptions["availabilities"][number],
  values: ProductFormValues,
) {
  return (
    availability.expansionId === values.expansionId &&
    availability.formatId === values.formatId &&
    availability.languageCode === values.languageCode &&
    (availability.variantLabel ?? "") === values.variantLabel
  );
}

import { AdminProductImageManager } from "@/components/admin/product-image-manager";

export function ProductForm({
  mode,
  action,
  catalogOptions,
  product,
  error,
  success,
}: {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  catalogOptions: AdminProductCatalogOptions;
  product?: AdminProductDetail | null;
  error?: string;
  success?: string;
}) {
  const values = buildInitialValues(product, catalogOptions);
  const [brandId, setBrandId] = useState(values.brandId);
  const [expansionId, setExpansionId] = useState(values.expansionId);
  const [formatId, setFormatId] = useState(values.formatId);
  const [languageCode, setLanguageCode] = useState<ProductLanguage>(values.languageCode);
  const [variantLabel, setVariantLabel] = useState(values.variantLabel);
  const [productName, setProductName] = useState(values.name);

  // ... calculation state continues ...
  const availableExpansions = catalogOptions.expansions.filter(
    (expansion) => expansion.brandId === brandId && (expansion.active || expansion.id === values.expansionId),
  );
  const availabilityForExpansion = catalogOptions.availabilities.filter(
    (availability) =>
      availability.expansionId === expansionId &&
      (availability.active || matchesInitialAvailabilitySelection(availability, values)),
  );
  const availableFormatIds = Array.from(
    new Set(availabilityForExpansion.map((availability) => availability.formatId)),
  );
  const availableFormats = catalogOptions.formats.filter(
    (format) => availableFormatIds.includes(format.id) || format.id === values.formatId,
  );
  const availabilityForFormat = availabilityForExpansion.filter(
    (availability) => availability.formatId === formatId,
  );
  const availableLanguageCodes = Array.from(
    new Set(availabilityForFormat.map((availability) => availability.languageCode)),
  ) as ProductLanguage[];
  const availableLanguages = catalogOptions.languages.filter(
    (language) =>
      availableLanguageCodes.includes(language.code) || language.code === values.languageCode,
  );
  const variantOptions = getVariantOptions(
    catalogOptions,
    expansionId,
    formatId,
    languageCode,
  );
  const canSubmitCatalogStructure =
    Boolean(brandId) &&
    availableExpansions.length > 0 &&
    Boolean(expansionId) &&
    availableFormats.length > 0 &&
    Boolean(formatId) &&
    availableLanguages.length > 0 &&
    Boolean(languageCode);
  const hasExplicitVariants = variantOptions.some((variant) => variant.length > 0);
  const variantSelectOptions = hasExplicitVariants
    ? [
        { value: "", label: "Selecciona una variante" },
        ...variantOptions
          .filter((variant) => variant.length > 0)
          .map((variant) => ({
            value: variant,
            label: variant,
          })),
      ]
    : [{ value: "", label: "Sin variante" }];
  const generatedIdentifiers = getGeneratedProductIdentifiers({
    catalogOptions,
    brandId,
    expansionId,
    formatId,
    languageCode,
    variantLabel,
    name: productName,
  });

  useEffect(() => {
    if (!availableExpansions.some((expansion) => expansion.id === expansionId)) {
      setExpansionId(availableExpansions[0]?.id ?? "");
    }
  }, [availableExpansions, expansionId]);

  useEffect(() => {
    if (!availableFormats.some((format) => format.id === formatId)) {
      setFormatId(availableFormats[0]?.id ?? "");
    }
  }, [availableFormats, formatId]);

  useEffect(() => {
    if (!availableLanguages.some((language) => language.code === languageCode)) {
      setLanguageCode(availableLanguages[0]?.code ?? "ES");
    }
  }, [availableLanguages, languageCode]);

  useEffect(() => {
    if (variantOptions.length === 0) {
      if (variantLabel) {
        setVariantLabel("");
      }
      return;
    }

    if (!variantOptions.includes(variantLabel)) {
      setVariantLabel(variantOptions[0] ?? "");
    }
  }, [variantOptions, variantLabel]);

  function handleBrandChange(event: ChangeEvent<HTMLSelectElement>) {
    setBrandId(event.target.value);
  }

  function handleExpansionChange(event: ChangeEvent<HTMLSelectElement>) {
    setExpansionId(event.target.value);
  }

  function handleFormatChange(event: ChangeEvent<HTMLSelectElement>) {
    setFormatId(event.target.value);
  }

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    setLanguageCode(event.target.value as ProductLanguage);
  }

  function handleVariantChange(event: ChangeEvent<HTMLSelectElement>) {
    setVariantLabel(event.target.value);
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setProductName(event.target.value);
  }

  return (
    <div className="space-y-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}

      {mode === "edit" && values.id ? (
         <AdminProductImageManager 
            productId={values.id} 
            coverImagePath={values.coverImagePath} 
            galleryImagePaths={values.galleryImagePaths} 
         /> 
      ) : null}

      <form action={action} encType="multipart/form-data" className="space-y-6">
        {values.id ? <input type="hidden" name="productId" value={values.id} /> : null}

        <FormSection
          eyebrow="Información básica"
          title="Nombre y descripción del producto"
          description="Escribe el nombre y descripción tal como los verán los clientes en la tienda. El resto (identificadores internos) se generan solos."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nombre del producto"
              name="name"
              defaultValue={values.name}
              onChange={handleNameChange}
              required
              className="md:col-span-2"
            />
            <TextAreaField
              label="Descripción"
              name="description"
              defaultValue={values.description}
              required
              className="md:col-span-2"
            />
            <ReadOnlyValue
              label="URL del producto (se genera solo)"
              value={generatedIdentifiers.slug || values.slug || "Se generará automáticamente cuando rellenes la estructura."}
              hint="La dirección web del producto. No tienes que escribirla tú."
            />
            <ReadOnlyValue
              label="Código interno (se genera solo)"
              value={generatedIdentifiers.sku || values.sku || "Se generará automáticamente cuando rellenes la estructura."}
              hint="Código para uso interno. Se genera solo a partir del nombre y la estructura."
            />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Estructura del catálogo"
          title="¿A qué marca, expansión y formato pertenece?"
          description="Primero elige la marca (Pokémon, One Piece…), luego la expansión y el formato. Si no ves la opción que buscas, tendrás que crearla antes en el apartado Catálogo."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              label="Tipo"
              name="productType"
              defaultValue={values.productType}
              options={[
                { value: "sealed", label: "Sellado" },
                { value: "single", label: "Carta individual" },
                { value: "accessory", label: "Accesorio" },
              ]}
            />

            <SelectField
              label="Marca"
              name="brandId"
              value={brandId}
              onChange={handleBrandChange}
              options={catalogOptions.brands.map((brand) => ({
                value: brand.id,
                label: brand.label,
              }))}
            />

            <SelectField
              label="Expansion"
              name="expansionId"
              value={expansionId}
              onChange={handleExpansionChange}
              required
              disabled={availableExpansions.length === 0}
              options={[
                {
                  value: "",
                  label:
                    availableExpansions.length > 0
                      ? "Selecciona una expansion"
                      : "No hay expansiones activas para esta marca",
                },
                ...availableExpansions.map((expansion) => ({
                  value: expansion.id,
                  label: expansion.label,
                })),
              ]}
            />

            <SelectField
              label="Formato"
              name="formatId"
              value={formatId}
              onChange={handleFormatChange}
              required
              disabled={availableFormats.length === 0}
              options={[
                {
                  value: "",
                  label:
                    availableFormats.length > 0
                      ? "Selecciona un formato"
                      : "No hay formatos activos para esta expansion",
                },
                ...availableFormats.map((format) => ({
                  value: format.id,
                  label: format.label,
                })),
              ]}
            />

            <SelectField
              label="Idioma"
              name="languageCode"
              value={languageCode}
              onChange={handleLanguageChange}
              required
              disabled={availableLanguages.length === 0}
              options={[
                {
                  value: "",
                  label:
                    availableLanguages.length > 0
                      ? "Selecciona un idioma"
                      : "No hay idiomas configurados para esta expansion y formato",
                },
                ...availableLanguages.map((language) => ({
                  value: language.code,
                  label: language.label,
                })),
              ]}
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <SelectField
              label="Variante"
              name="variantLabel"
              value={variantLabel}
              onChange={handleVariantChange}
              disabled={!hasExplicitVariants}
              options={variantSelectOptions}
            />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Cómo funciona
              </p>
              <p className="mt-3">
                Selecciona primero la <span className="text-white">marca</span>, luego la expansión y el formato. Los idiomas y variantes disponibles se filtran solos según lo que hayas configurado.
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Marca seleccionada: {getBrandLabel(catalogOptions, brandId)}.
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Si no ves el formato o idioma que necesitas, ve a <span className="text-white">Catálogo → Configuración</span> y añádelo allí primero.
              </p>
            </div>
          </div>

          {!canSubmitCatalogStructure ? (
            <div className="mt-4 rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-4 text-sm leading-7 text-amber-100">
              No se puede crear el producto todavía. Completa una estructura válida de marca,
              expansión, formato e idioma antes de guardar.
            </div>
          ) : null}
        </FormSection>

        <FormSection
          eyebrow="Precio y disponibilidad"
          title="¿Cuánto cuesta y cuántas unidades tienes?"
          description="Introduce el precio de venta y el stock disponible. El precio comparado es el precio anterior (tachado) que se muestra en la tienda cuando hay descuento."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label="Precio"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={String(values.price)}
              required
            />
            <Field
              label="Precio comparado"
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={values.compareAtPrice?.toString() ?? ""}
            />
            <Field
              label="Stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              defaultValue={String(values.stock)}
              required
            />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Visibilidad"
          title="¿Cómo aparece en la tienda?"
          description="Controla si el producto es visible, si aparece destacado en portada y si está en modo preventa (los clientes pueden verlo pero el pedido se gestiona diferente)."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <CheckboxField label="Visible en la tienda" name="active" defaultChecked={values.active} />
            <CheckboxField label="Destacado en portada" name="featured" defaultChecked={values.featured} />
            <CheckboxField
              label="En preventa"
              name="isPreorder"
              defaultChecked={values.isPreorder}
            />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Detalles adicionales"
          title="Rareza, condición y etiqueta"
          description="Campos opcionales para cartas individuales o productos con condición específica. La mayoría de productos sellados se pueden dejar en blanco."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Rareza" name="rarity" defaultValue={values.attributes.rarity} placeholder="Ej: Rare, Ultra Rare" />
            <SelectField
              label="Condición"
              name="condition"
              defaultValue={values.attributes.condition ?? ""}
              options={[
                { value: "", label: "Sin condición" },
                { value: "NM", label: "NM — Near Mint" },
                { value: "EX", label: "EX — Excellent" },
                { value: "LP", label: "LP — Lightly Played" },
                { value: "GD", label: "GD — Good" },
              ]}
            />
            <Field label="Etiqueta visual" name="badge" defaultValue={values.attributes.badge} placeholder="Ej: Nuevo, Oferta" />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Etiquetas"
          title="Palabras clave del producto"
          description="Añade etiquetas separadas por coma para facilitar la búsqueda interna. Es opcional."
        >
          <Field
            label="Etiquetas"
            name="tags"
            defaultValue={values.tags.join(", ")}
            placeholder="pokemon, sellado, booster, preventa"
            hint="Sepáralas con comas. Se limpian automáticamente."
          />
        </FormSection>

        {mode === "create" ? (
          <FormSection
            eyebrow="Imágenes"
            title="Foto principal y galería"
            description="Sube la imagen de portada del producto y fotos adicionales. También puedes añadirlas después desde la ficha del producto."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <FileField
                label="Foto principal (portada)"
                name="coverImage"
                accept="image/webp,image/png,image/jpeg"
                hint="Opcional ahora — puedes subirla después. Esta imagen aparece en el listado de la tienda."
              />
              <FileField
                label="Galería de fotos"
                name="galleryImages"
                type="file"
                multiple
                accept="image/webp,image/png,image/jpeg"
                hint="Opcional. Selecciona varias fotos a la vez para mostrarlas en la ficha del producto."
              />
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Nota sobre las imágenes
              </p>
              <p className="mt-3">
                Si ahora no tienes las fotos, no pasa nada — el producto se crea igual y podrás
                añadir las imágenes después desde la ficha de edición.
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Formatos admitidos: webp, png, jpg. Tamaño máximo: 8 MB por imagen.
              </p>
            </div>
          </FormSection>
        ) : null}

        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            {mode === "edit" && values.id ? (
              <span className="text-xs text-slate-600">
                ID interno: <span className="text-slate-500">{values.id}</span>
              </span>
            ) : (
              <span>
                {canSubmitCatalogStructure
                  ? "Rellena los campos obligatorios y pulsa el botón para crear el producto."
                  : "Falta una estructura válida de catálogo antes de poder guardar."}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/productos">Cancelar y volver</Link>
            </Button>
            <FormSubmitButton mode={mode} disabled={!canSubmitCatalogStructure} />
          </div>
        </div>
      </form>
    </div>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  hint,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  name: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={["space-y-2", className].filter(Boolean).join(" ")}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <Input name={name} {...props} />
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

function TextAreaField({
  label,
  name,
  hint,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={["space-y-2", className].filter(Boolean).join(" ")}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <textarea name={name} className={textareaClassName} {...props} />
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

function FileField({
  label,
  name,
  hint,
  className,
  type,
  ...props
}: ComponentPropsWithoutRef<"input"> & {
  label: string;
  name: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={["space-y-2", className].filter(Boolean).join(" ")}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <input name={name} type={type ?? "file"} className={fileInputClassName} {...props} />
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  value,
  onChange,
  required,
  disabled,
  hint,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}) {
  const selectProps =
    value !== undefined
      ? { value, onChange }
      : { defaultValue };

  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <NativeSelect name={name} required={required} disabled={disabled} {...selectProps}>
        {options.map((option) => (
          <option
            key={option.value || option.label}
            value={option.value}
            className={selectOptionClassName}
          >
            {option.label}
          </option>
        ))}
      </NativeSelect>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

function ReadOnlyValue({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200">
        {value}
      </div>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </div>
  );
}

function NativeSelect({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative">
      <select
        className={[selectClassName, className].filter(Boolean).join(" ")}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--color-primary)]"
      />
      <span className="text-sm font-medium text-white">{label}</span>
    </label>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: string;
}) {
  return (
    <div
      className={[
        "rounded-[24px] border px-4 py-3 text-sm leading-6",
        tone === "error"
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function FormSubmitButton({
  mode,
  disabled = false,
}: {
  mode: "create" | "edit";
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending || disabled}>
      {pending
        ? mode === "create"
          ? "Creando producto…"
          : "Guardando cambios…"
        : mode === "create"
          ? "Crear producto"
          : "Guardar cambios"}
    </Button>
  );
}
