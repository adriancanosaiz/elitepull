"use client";

import type {
  ChangeEvent,
  ComponentProps,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AdminCategoryOption,
  AdminProductDetail,
} from "@/lib/admin/products";

const selectClassName =
  "flex h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const textareaClassName =
  "flex min-h-[140px] w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

type ProductFormValues = {
  id?: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  productType: "sealed" | "single" | "accessory";
  brandSlug: "pokemon" | "one-piece" | "riftbound" | "magic" | "accesorios";
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isPreorder: boolean;
  tags: string[];
  attributes: {
    expansion: string;
    language?: "ES" | "EN" | "JP";
    rarity: string;
    condition?: "NM" | "EX" | "LP" | "GD";
    badge: string;
  },
  coverImagePath: string;
  galleryImagePaths: string[];
};

const defaultValues: ProductFormValues = {
  id: undefined,
  slug: "",
  sku: "",
  name: "",
  description: "",
  productType: "sealed",
  brandSlug: "pokemon",
  categoryId: "",
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  active: true,
  featured: false,
  isPreorder: false,
  tags: [],
  attributes: {
    expansion: "",
    language: undefined,
    rarity: "",
    condition: undefined,
    badge: "",
  },
  coverImagePath: "",
  galleryImagePaths: [],
};

function buildInitialValues(product?: AdminProductDetail | null): ProductFormValues {
  if (!product) {
    return defaultValues;
  }

  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    name: product.name,
    description: product.description,
    productType: product.productType,
    brandSlug: product.brandSlug,
    categoryId: product.categoryId,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    active: product.active,
    featured: product.featured,
    isPreorder: product.isPreorder,
    tags: product.tags,
    attributes: {
      expansion: product.attributes.expansion ?? "",
      language: product.attributes.language,
      rarity: product.attributes.rarity ?? "",
      condition: product.attributes.condition,
      badge: product.attributes.badge ?? "",
    },
    coverImagePath: product.coverImagePath ?? "",
    galleryImagePaths: product.galleryImagePaths,
  };
}

function brandLabel(brandSlug: string) {
  switch (brandSlug) {
    case "pokemon":
      return "Pokemon";
    case "one-piece":
      return "One Piece";
    case "riftbound":
      return "Riftbound";
    case "magic":
      return "Magic";
    case "accesorios":
      return "Accesorios";
    default:
      return brandSlug;
  }
}

export function ProductForm({
  mode,
  action,
  categories,
  product,
  error,
  success,
}: {
  mode: "create" | "edit";
  action: (formData: FormData) => void | Promise<void>;
  categories: AdminCategoryOption[];
  product?: AdminProductDetail | null;
  error?: string;
  success?: string;
}) {
  const values = buildInitialValues(product);
  const [brandSlug, setBrandSlug] = useState(values.brandSlug);
  const [categoryId, setCategoryId] = useState(values.categoryId);
  const availableCategories = categories.filter((category) => category.brandSlug === brandSlug);
  const selectedCategory = availableCategories.find((category) => category.id === categoryId);
  const coverPlaceholder = values.id
    ? `products/${values.id}/cover.webp`
    : "products/{productId}/cover.webp";
  const galleryPlaceholder = values.id
    ? `products/${values.id}/gallery/01.webp`
    : "products/{productId}/gallery/01.webp";
  const secondGalleryPlaceholder = galleryPlaceholder.replace("/01.", "/02.");

  function handleBrandChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextBrandSlug = event.target.value as ProductFormValues["brandSlug"];
    setBrandSlug(nextBrandSlug);
    setCategoryId((currentCategoryId) => {
      const stillValid = categories.some(
        (category) =>
          category.id === currentCategoryId && category.brandSlug === nextBrandSlug,
      );

      return stillValid ? currentCategoryId : "";
    });
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    setCategoryId(event.target.value);
  }

  return (
    <div className="space-y-6">
      {error ? (
        <Notice tone="error">{error}</Notice>
      ) : null}

      {success ? (
        <Notice tone="success">{success}</Notice>
      ) : null}

      <form action={action} className="space-y-6">
        {values.id ? <input type="hidden" name="id" value={values.id} /> : null}

        <FormSection
          eyebrow="Core"
          title="Identidad principal del producto"
          description="Slug, SKU y contenido principal para storefront, admin y scripts."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Slug" name="slug" defaultValue={values.slug} required />
            <Field label="SKU" name="sku" defaultValue={values.sku} required />
            <Field
              label="Nombre"
              name="name"
              defaultValue={values.name}
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
          </div>
        </FormSection>

        <FormSection
          eyebrow="Clasificacion"
          title="Tipo, marca y categoria"
          description="La categoria se guarda como `categoryId` y debe pertenecer a la marca elegida."
        >
          <div className="grid gap-4 md:grid-cols-3">
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
              name="brandSlug"
              value={brandSlug}
              onChange={handleBrandChange}
              options={[
                { value: "pokemon", label: "Pokemon" },
                { value: "one-piece", label: "One Piece" },
                { value: "riftbound", label: "Riftbound" },
                { value: "magic", label: "Magic" },
                { value: "accesorios", label: "Accesorios" },
              ]}
            />

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Categoria
              </span>
              <select
                name="categoryId"
                value={categoryId}
                onChange={handleCategoryChange}
                className={selectClassName}
                disabled={availableCategories.length === 0}
                required
              >
                <option value="">
                  {availableCategories.length > 0
                    ? "Selecciona una categoria"
                    : "No hay categorias activas para esta marca"}
                </option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-slate-500">
                {availableCategories.length > 0
                  ? `${availableCategories.length} categorias activas para ${brandLabel(brandSlug)}.`
                  : `No hay categorias activas para ${brandLabel(brandSlug)}.`}
                {selectedCategory?.description
                  ? ` ${selectedCategory.description}`
                  : " Si cambias de marca y la categoria anterior ya no aplica, se limpia automaticamente."}
              </p>
            </label>
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
          eyebrow="Attributes"
          title="Atributos basicos"
          description="Campos ligeros para singles, sellado, accesorios y lectura editorial del storefront."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Field
              label="Expansion"
              name="expansion"
              defaultValue={values.attributes.expansion}
            />
            <SelectField
              label="Idioma"
              name="language"
              defaultValue={values.attributes.language ?? ""}
              options={[
                { value: "", label: "Sin idioma" },
                { value: "ES", label: "ES" },
                { value: "EN", label: "EN" },
                { value: "JP", label: "JP" },
              ]}
            />
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
          eyebrow="Media V1"
          title="Rutas simples de portada y galeria"
          description="No hay uploader todavia. Puedes dejar estos campos vacios al crear y completarlos despues."
        >
          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Convencion esperada
              </p>
              <div className="mt-3 space-y-2 font-mono text-xs text-slate-200">
                <p>{coverPlaceholder}</p>
                <p>{galleryPlaceholder}</p>
                <p>{secondGalleryPlaceholder}</p>
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                {values.id
                  ? "Este producto ya tiene id, asi que puedes usar rutas reales basadas en ese UUID."
                  : "En alta todavia no conoces el UUID final. Puedes dejar la media vacia, crear primero el producto y volver despues para completar los paths exactos."}
              </p>
            </div>

            <Field
              label="Cover image path"
              name="coverImagePath"
              defaultValue={values.coverImagePath}
              placeholder={coverPlaceholder}
              hint={`Portada canonica recomendada: ${coverPlaceholder}`}
            />
            <TextAreaField
              label="Gallery image paths"
              name="galleryImagePaths"
              defaultValue={values.galleryImagePaths.join("\n")}
              placeholder={`${galleryPlaceholder}\n${secondGalleryPlaceholder}`}
              hint="Una ruta por linea. Se guardaran en el mismo orden en que las escribas, sin uploader intermedio."
            />
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
            placeholder="pokemon, single, chase"
            hint="Separadas por coma. El schema las limpia y elimina duplicados."
          />
        </FormSection>

        <div className="flex flex-col gap-3 rounded-[28px] border border-white/10 bg-black/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            {mode === "edit" && values.id ? (
              <span>ID del producto: <span className="text-slate-200">{values.id}</span></span>
            ) : (
              <span>Si dejas la media vacia al crear, podras completarla despues desde la edicion.</span>
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

function SelectField({
  label,
  name,
  options,
  defaultValue,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
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
      <select name={name} className={selectClassName} {...selectProps}>
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
