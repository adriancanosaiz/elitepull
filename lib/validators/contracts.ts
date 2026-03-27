import { z } from "zod";

const brandSlugSchema = z.enum([
  "pokemon",
  "one-piece",
  "riftbound",
  "magic",
  "accesorios",
  "preventa",
]);

const productTypeSchema = z.enum(["sealed", "single", "accessory"]);
const productCategorySlugSchema = z.enum([
  "sobres",
  "etb",
  "blister-3-sobres",
  "booster-packs",
  "ediciones-especiales",
  "sobres-individuales",
  "cajas",
  "commander-decks",
  "booster-normales",
  "booster-coleccion",
  "fundas",
  "deck-boxes",
  "binders",
  "toploaders",
  "dados-tapetes",
  "cartas-individuales",
]);
const productLanguageSchema = z.enum(["ES", "EN", "JP"]);
const productConditionSchema = z.enum(["NM", "EX", "LP", "GD"]);
const sortOptionSchema = z.enum([
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
  "stock-desc",
]);

export const productReferenceSchema = z.object({
  slug: brandSlugSchema,
  label: z.string().min(1),
  href: z.string().min(1),
});

export const categoryReferenceSchema = z.object({
  slug: productCategorySlugSchema,
  label: z.string().min(1),
  href: z.string().min(1).optional(),
});

export const productCardItemSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  href: z.string().min(1),
  type: productTypeSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  brand: productReferenceSchema,
  category: categoryReferenceSchema,
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative(),
  featured: z.boolean(),
  isPreorder: z.boolean(),
  expansion: z.string().min(1).optional(),
  language: productLanguageSchema.optional(),
  rarity: z.string().min(1).optional(),
  condition: productConditionSchema.optional(),
  badge: z.string().min(1).optional(),
  image: z.string().min(1),
  tags: z.array(z.string()),
});

export const productDetailSchema = productCardItemSchema.extend({
  images: z.array(z.string().min(1)).min(1),
  stockLabel: z.string().min(1),
  details: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
});

export const collectionFilterOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  count: z.number().int().nonnegative(),
});

export const collectionQuerySchema = z.object({
  sort: sortOptionSchema,
  brand: z.array(brandSlugSchema),
  category: z.array(productCategorySlugSchema),
  expansion: z.array(z.string().min(1)),
  language: z.array(productLanguageSchema),
  priceMin: z.number().nonnegative().optional(),
  priceMax: z.number().nonnegative().optional(),
  inStock: z.boolean(),
  isPreorder: z.boolean(),
  featured: z.boolean(),
});

export const collectionResponseSchema = z.object({
  items: z.array(productCardItemSchema),
  total: z.number().int().nonnegative(),
  query: collectionQuerySchema,
  filters: z.object({
    brands: z.array(collectionFilterOptionSchema),
    categories: z.array(collectionFilterOptionSchema),
    expansions: z.array(collectionFilterOptionSchema),
    languages: z.array(collectionFilterOptionSchema),
    price: z.object({
      min: z.number().nonnegative(),
      max: z.number().nonnegative(),
    }),
  }),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  href: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  image: z.string().min(1),
  brandLabel: z.string().min(1),
  expansion: z.string().min(1).optional(),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
  lineTotal: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  isPreorder: z.boolean(),
});

export const cartSummarySchema = z.object({
  itemCount: z.number().int().nonnegative(),
  subtotal: z.number().nonnegative(),
  shipping: z.number().nonnegative(),
  total: z.number().nonnegative(),
  isEmpty: z.boolean(),
});
