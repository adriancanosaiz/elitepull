import { z } from "zod";

import { createUuidLikeSchema } from "@/lib/validators/uuid-like";

const brandSlugSchema = z.enum([
  "pokemon",
  "one-piece",
  "riftbound",
  "magic",
  "accesorios",
  "preventa",
]);

const productTypeSchema = z.enum(["sealed", "single", "accessory"]);
const statusSchema = z.enum(["active", "draft"]);

const imageFileNameSchema = z
  .string()
  .trim()
  .min(1, "Image file name is required")
  .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*\.webp$/i, "Image files must be flat .webp files");

export const categoryImportSchema = z.object({
  id: createUuidLikeSchema("Category id must be a valid UUID"),
  brandSlug: brandSlugSchema,
  slug: z.string().trim().min(1, "Category slug is required"),
  label: z.string().trim().min(1, "Category label is required"),
  description: z.string().trim().min(1, "Category description is required"),
  sortOrder: z.number().int().nonnegative("Category sortOrder must be >= 0"),
  active: z.boolean().optional().default(true),
});

export const productMediaGalleryItemSchema = z.object({
  file: imageFileNameSchema,
  alt: z.string().trim().min(1).optional(),
});

export const productMediaImportSchema = z.object({
  coverFile: imageFileNameSchema,
  coverAlt: z.string().trim().min(1).optional(),
  gallery: z.array(productMediaGalleryItemSchema).optional().default([]),
});

export const productImportSchema = z.object({
  id: createUuidLikeSchema("Product id must be a valid UUID"),
  slug: z.string().trim().min(1, "Product slug is required"),
  sku: z.string().trim().min(1, "Product SKU is required"),
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().trim().min(1, "Product description is required"),
  productType: productTypeSchema,
  brandSlug: brandSlugSchema,
  formatSlug: z.string().trim().min(1, "Product formatSlug is required").optional(),
  categorySlug: z.string().trim().min(1, "Product categorySlug is required").optional(),
  price: z.number().nonnegative("Product price must be >= 0"),
  compareAtPrice: z.number().nonnegative("compareAtPrice must be >= 0").optional(),
  featured: z.boolean().optional().default(false),
  isPreorder: z.boolean().optional().default(false),
  status: statusSchema.optional(),
  stock: z.number().int().nonnegative("Product stock must be >= 0"),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  attributes: z.record(z.string(), z.unknown()).optional().default({}),
  media: productMediaImportSchema,
})
  .superRefine((product, ctx) => {
    if (!product.formatSlug && !product.categorySlug) {
      ctx.addIssue({
        code: "custom",
        path: ["formatSlug"],
        message: "Product formatSlug is required",
      });
    }
  })
  .transform((product) => {
    const formatSlug = product.formatSlug ?? product.categorySlug ?? "";
    const { categorySlug: _legacyCategorySlug, ...rest } = product;

    return {
      ...rest,
      formatSlug,
    };
  });

export const catalogImportSchema = z
  .object({
    categories: z.array(categoryImportSchema).optional().default([]),
    products: z.array(productImportSchema),
  })
  .superRefine((catalog, ctx) => {
    const productIds = new Set<string>();
    const productSlugs = new Set<string>();
    const productSkus = new Set<string>();

    for (const [index, product] of catalog.products.entries()) {
      if (productIds.has(product.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["products", index, "id"],
          message: `Duplicate product id ${product.id}`,
        });
      }

      if (productSlugs.has(product.slug)) {
        ctx.addIssue({
          code: "custom",
          path: ["products", index, "slug"],
          message: `Duplicate product slug ${product.slug}`,
        });
      }

      if (productSkus.has(product.sku)) {
        ctx.addIssue({
          code: "custom",
          path: ["products", index, "sku"],
          message: `Duplicate product SKU ${product.sku}`,
        });
      }

      if (product.compareAtPrice !== undefined && product.compareAtPrice < product.price) {
        ctx.addIssue({
          code: "custom",
          path: ["products", index, "compareAtPrice"],
          message: "compareAtPrice cannot be lower than price",
        });
      }

      const galleryFiles = new Set<string>();

      for (const [galleryIndex, image] of product.media.gallery.entries()) {
        if (galleryFiles.has(image.file)) {
          ctx.addIssue({
            code: "custom",
            path: ["products", index, "media", "gallery", galleryIndex, "file"],
            message: `Duplicate gallery file ${image.file} in product ${product.slug}`,
          });
        }

        galleryFiles.add(image.file);
      }

      productIds.add(product.id);
      productSlugs.add(product.slug);
      productSkus.add(product.sku);
    }
  });

export type CategoryImport = z.infer<typeof categoryImportSchema>;
export type ProductMediaGalleryItemImport = z.infer<typeof productMediaGalleryItemSchema>;
export type ProductMediaImport = z.infer<typeof productMediaImportSchema>;
export type ProductImport = z.infer<typeof productImportSchema>;
export type CatalogImport = z.infer<typeof catalogImportSchema>;
