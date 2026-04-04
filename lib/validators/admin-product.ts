import { z } from "zod";

import { createUuidLikeSchema } from "@/lib/validators/uuid-like";

const productTypeSchema = z.enum(["sealed", "single", "accessory"]);
const productLanguageSchema = z.enum(["ES", "EN", "JP"]);
const productConditionSchema = z.enum(["NM", "EX", "LP", "GD"]);

function normalizeOptionalString(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeRequiredString(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    return value;
  }

  return value.trim();
}

function parseFormBoolean(value: unknown) {
  if (value === true || value === "true" || value === "on") {
    return true;
  }

  return false;
}

function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return undefined;
    }

    return Number(trimmedValue);
  }

  return value;
}

function normalizeTagList(value: unknown) {
  if (value === null || value === undefined) {
    return [];
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const tags = rawValues.flatMap((entry) =>
    typeof entry === "string" ? entry.split(",") : [],
  );

  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}

function normalizeGalleryPaths(value: unknown) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return value;
}

const optionalTextField = z.preprocess(
  normalizeOptionalString,
  z.string().min(1).optional(),
);

function createRequiredTextField(message: string) {
  return z.preprocess(
    normalizeRequiredString,
    z.string(message).trim().min(1, message),
  );
}

function createRequiredUuidField(message: string) {
  return createRequiredTextField(message).pipe(createUuidLikeSchema(message));
}

function createRequiredEnumField<const TValues extends readonly [string, ...string[]]>(
  values: TValues,
  message: string,
) {
  return createRequiredTextField(message)
    .refine((value): value is TValues[number] => values.includes(value), message)
    .transform((value) => value as TValues[number]);
}

const optionalPriceField = z.preprocess(
  parseOptionalNumber,
  z.number().nonnegative("El precio no puede ser negativo.").optional(),
);

const mediaPathSchema = z
  .string()
  .trim()
  .min(1, "La ruta no puede estar vacia.")
  .refine(
    (value) =>
      value.startsWith("products/") ||
      value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/storage/v1/object/public/") ||
      value.startsWith("/"),
    "La ruta de media debe ser un storage path valido o una URL publica.",
  );

const optionalMediaPathSchema = z.preprocess(
  normalizeOptionalString,
  mediaPathSchema.optional(),
);

export const adminProductAttributesSchema = z.object({
  rarity: optionalTextField,
  condition: z.preprocess(
    normalizeOptionalString,
    productConditionSchema.optional(),
  ),
  badge: optionalTextField,
});

export const adminProductSchema = z
  .object({
    id: z.preprocess(
      normalizeOptionalString,
      createUuidLikeSchema("El id debe ser un UUID valido.").optional(),
    ),
    slug: optionalTextField,
    sku: optionalTextField,
    name: createRequiredTextField("El nombre es obligatorio."),
    description: createRequiredTextField("La descripcion es obligatoria."),
    productType: createRequiredEnumField(
      ["sealed", "single", "accessory"],
      "Selecciona el tipo de producto.",
    ),
    brandId: createRequiredUuidField("Selecciona una marca valida."),
    expansionId: createRequiredUuidField("Selecciona una expansion valida."),
    formatId: createRequiredUuidField("Selecciona un formato valido."),
    languageCode: createRequiredEnumField(
      ["ES", "EN", "JP"],
      "Selecciona un idioma valido.",
    ),
    variantLabel: optionalTextField,
    price: z.preprocess(
      parseOptionalNumber,
      z
        .number("Introduce un precio valido.")
        .nonnegative("El precio no puede ser negativo."),
    ),
    compareAtPrice: optionalPriceField,
    featured: z.preprocess(parseFormBoolean, z.boolean()),
    isPreorder: z.preprocess(parseFormBoolean, z.boolean()),
    active: z.preprocess(parseFormBoolean, z.boolean()),
    stock: z.preprocess(
      parseOptionalNumber,
      z
        .number("Introduce un stock valido.")
        .int("El stock debe ser un entero.")
        .nonnegative("El stock no puede ser negativo."),
    ),
    tags: z.preprocess(normalizeTagList, z.array(z.string().min(1))),
    attributes: adminProductAttributesSchema.default({}),
    coverImagePath: optionalMediaPathSchema,
    galleryImagePaths: z.preprocess(
      normalizeGalleryPaths,
      z.array(mediaPathSchema).optional(),
    ),
  })
  .superRefine((product, ctx) => {
    if (product.compareAtPrice !== undefined && product.compareAtPrice < product.price) {
      ctx.addIssue({
        code: "custom",
        path: ["compareAtPrice"],
        message: "El precio comparado no puede ser menor que el precio actual.",
      });
    }

    const galleryPaths = product.galleryImagePaths ?? [];
    const uniqueGalleryPaths = new Set<string>();

    galleryPaths.forEach((path, index) => {
      if (uniqueGalleryPaths.has(path)) {
        ctx.addIssue({
          code: "custom",
          path: ["galleryImagePaths", index],
          message: "No repitas la misma imagen dentro de la galeria.",
        });
      }

      uniqueGalleryPaths.add(path);
    });

    if (product.coverImagePath && uniqueGalleryPaths.has(product.coverImagePath)) {
      ctx.addIssue({
        code: "custom",
        path: ["coverImagePath"],
        message: "La portada no debe repetirse dentro de la galeria.",
      });
    }
  });

export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminProductAttributesInput = z.infer<typeof adminProductAttributesSchema>;
