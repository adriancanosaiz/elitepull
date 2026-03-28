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
import type {
  AdminCategoryOption,
  AdminProductDetail,
} from "@/lib/admin/products";
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
  categoryId: string;
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
      categoryId: "",
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
    categoryId: product.categoryId,
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

export function ProductForm({
  mode,
  action,
  categories,
  catalogOptions,
  product,
  error,
  success,
}: {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  categories: AdminCategoryOption[];
  catalogOptions: AdminProductCatalogOptions;
  product?: AdminProductDetail | null;
  error?: string;
  success?: string;
}) {
  const values = buildInitialValues(product, catalogOptions);
  const [brandId, setBrandId] = useState(values.brandId);
  const [categoryId, setCategoryId] = useState(values.categoryId);
  const [expansionId, setExpansionId] = useState(values.expansionId);
  const [formatId, setFormatId] = useState(values.formatId);
  const [languageCode, setLanguageCode] = useState<ProductLanguage>(values.languageCode);
  const [variantLabel, setVariantLabel] = useState(values.variantLabel);
  const [productName, setProductName] = useState(values.name);

  const availableCategories = categories.filter(
    (category) => category.brandId === brandId || category.id === values.categoryId,
  );
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
    if (!availableCategories.some((category) => category.id === categoryId)) {
      setCategoryId(availableCategories[0]?.id ?? "");
    }
  }, [availableCategories, categoryId]);

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

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setCategoryId(event.target.value);
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

      <form action={action} encType="multipart/form-data" className="space-y-6">
        {values.id ? <input type="hidden" name="productId" value={values.id} /> : null}

        <FormSection
          eyebrow="Core"
          title="Identidad principal del producto"
          description="Nombre, descripcion y datos base. El slug publico y el SKU interno se generan automaticamente."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nombre"
              name="name"
              defaultValue={values.name}
              onChange={handleNameChange}
              required
              className="md:col-span-2"
            />
            <TextAreaField
              label="Descripcion"
              name="description"
              defaultValue={values.description}
              required
              className="md:col-span-2"
            />
            <ReadOnlyValue
              label="Slug autogenerado"
              value={generatedIdentifiers.slug || values.slug || "Se generara al completar la estructura."}
              hint="Se recalcula a partir de marca, expansion, formato, idioma, variante y nombre."
            />
            <ReadOnlyValue
              label="SKU autogenerado"
              value={generatedIdentifiers.sku || values.sku || "Se generara al completar la estructura."}
              hint="Se usa para operativa interna y busqueda; no necesitas escribirlo a mano."
            />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Estructura"
          title="Marca, expansion, formato e idioma"
          description="La arquitectura del catalogo sale de BD. Si una combinacion no existe, primero debes crearla en admin."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
              label="Categoria storefront"
              name="categoryId"
              value={categoryId}
              onChange={handleCategoryChange}
              required
              disabled={availableCategories.length === 0}
              options={[
                {
                  value: "",
                  label:
                    availableCategories.length > 0
                      ? "Selecciona una categoria"
                      : "No hay categorias activas para esta marca",
                },
                ...availableCategories.map((category) => ({
                  value: category.id,
                  label: category.label,
                })),
              ]}
              hint="Sirve para agrupar y navegar en storefront. No sustituye al formato comercial."
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
                Regla de seleccion
              </p>
              <p className="mt-3">
                Las opciones de formato, idioma y variante dependen de la configuracion activa del
                catalogo. Si te falta alguna combinacion, creala primero en
                <span className="text-white"> /admin/catalogo/configuracion</span>.
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Marca actual: {getBrandLabel(catalogOptions, brandId)}.
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Categoria storefront organiza la navegacion. Formato define el tipo real de
                producto: ETB, Booster Pack, Bundle, Commander Deck, etc.
              </p>
            </div>
          </div>
        </FormSection>

        <FormSection
          eyebrow="Pricing"
          title="Precio y stock"
          description="Configuracion simple de precio actual, precio comparado y stock disponible."
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
          eyebrow="Flags"
          title="Estado editorial"
          description="Control rapido para storefront, visibilidad y campañas de preventa."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <CheckboxField label="Activo" name="active" defaultChecked={values.active} />
            <CheckboxField label="Featured" name="featured" defaultChecked={values.featured} />
            <CheckboxField
              label="Preventa"
              name="isPreorder"
              defaultChecked={values.isPreorder}
            />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Atributos"
          title="Atributos editoriales"
          description="Deja aqui solo lo secundario: rareza, condicion y badge visual."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Rareza" name="rarity" defaultValue={values.attributes.rarity} />
            <SelectField
              label="Condicion"
              name="condition"
              defaultValue={values.attributes.condition ?? ""}
              options={[
                { value: "", label: "Sin condicion" },
                { value: "NM", label: "NM" },
                { value: "EX", label: "EX" },
                { value: "LP", label: "LP" },
                { value: "GD", label: "GD" },
              ]}
            />
            <Field label="Badge" name="badge" defaultValue={values.attributes.badge} />
          </div>
        </FormSection>

        <FormSection
          eyebrow="Tags"
          title="Etiquetado simple"
          description="Usa CSV sencillo para acelerar el alta y la edicion."
        >
          <Field
            label="Tags"
            name="tags"
            defaultValue={values.tags.join(", ")}
            placeholder="pokemon, sellado, premium"
            hint="Separadas por coma. El schema las limpia y elimina duplicados."
          />
        </FormSection>

        {mode === "create" ? (
          <FormSection
            eyebrow="Media"
            title="Cover y galeria inicial"
            description="Puedes dejar el producto listo desde el alta. Si ahora no subes imagenes, podras hacerlo despues desde la ficha."
          >
            <div className="grid gap-4 xl:grid-cols-2">
              <FileField
                label="Cover"
                name="coverImage"
                accept="image/webp,image/png,image/jpeg"
                hint="Opcional. Sube una unica imagen para la portada principal."
              />
              <FileField
                label="Galeria"
                name="galleryImages"
                type="file"
                multiple
                accept="image/webp,image/png,image/jpeg"
                hint="Opcional. Puedes seleccionar varias imagenes; se guardan en el orden de seleccion."
              />
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Uploader inicial
              </p>
              <p className="mt-3">
                La creacion del producto y la subida de media ocurren en el mismo flujo. Si la
                media falla, el producto se crea igualmente y podras completarla despues desde su
                ficha.
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-500">
                Formatos V1: webp, png, jpg y jpeg. Limite: 8 MB por archivo.
              </p>
            </div>
          </FormSection>
        ) : null}

        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            {mode === "edit" && values.id ? (
              <span>
                ID del producto: <span className="text-slate-200">{values.id}</span>
              </span>
            ) : (
              <span>
                Puedes subir cover y galeria ahora mismo o completarlas despues desde la ficha.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/productos">Volver al listado</Link>
            </Button>
            <FormSubmitButton mode={mode} />
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
}: {
  mode: "create" | "edit";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending
        ? mode === "create"
          ? "Creando..."
          : "Guardando..."
        : mode === "create"
          ? "Crear producto"
          : "Guardar cambios"}
    </Button>
  );
}
