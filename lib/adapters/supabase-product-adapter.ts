import type { Database } from "@/lib/supabase/database.types";
import { buildAutomaticProductImageAlt } from "@/lib/product-media-alt";
import {
  normalizeProductMediaPath,
  resolveProductMediaUrl,
} from "@/lib/supabase/storage";
import type { Product } from "@/types/store";

type ProductAttributes = {
  rarity?: string;
  condition?: Product["condition"];
  badge?: string;
};

type BrandRow = Pick<
  Database["public"]["Tables"]["brands"]["Row"],
  "id" | "slug" | "label"
>;

type ExpansionRow = Pick<
  Database["public"]["Tables"]["expansions"]["Row"],
  "id" | "slug" | "label" | "release_status"
>;

type FormatRow = Pick<
  Database["public"]["Tables"]["product_formats"]["Row"],
  "id" | "slug" | "label"
>;

type ProductImageRow = Pick<
  Database["public"]["Tables"]["product_images"]["Row"],
  "storage_path" | "sort_order" | "is_primary" | "alt_text"
>;

type InventoryRow = Pick<
  Database["public"]["Tables"]["inventory"]["Row"],
  "available_quantity"
>;

export type SupabaseProductRecord = Database["public"]["Tables"]["products"]["Row"] & {
  brand: BrandRow | null;
  expansion: ExpansionRow | null;
  format: FormatRow | null;
  images: ProductImageRow[] | null;
  inventory: InventoryRow | InventoryRow[] | null;
};

const PRODUCT_IMAGE_FALLBACKS: Record<Product["type"], string> = {
  sealed: "/mock/products/pokemon-etb.svg",
  single: "/mock/products/single-charizard.svg",
  accessory: "/mock/products/accessory-box.svg",
};

function parseAttributes(value: Database["public"]["Tables"]["products"]["Row"]["attributes"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as ProductAttributes;
  }

  return value as ProductAttributes;
}

function parseNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function parseOptionalNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsed = parseNumber(value);
  return parsed > 0 ? parsed : undefined;
}

function buildProductImages(record: SupabaseProductRecord, productType: Product["type"]) {
  const normalizedCoverPath = normalizeProductMediaPath(record.main_image_path);
  const galleryEntries = (record.images ?? [])
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((image) => ({
      path: normalizeProductMediaPath(image.storage_path),
      altText: image.alt_text?.trim() || "",
      sortOrder: image.sort_order,
    }))
    .filter((image): image is { path: string; altText: string; sortOrder: number } =>
      Boolean(image.path),
    );

  const uniqueImages: Array<{ path: string; altText: string }> = [];

  if (normalizedCoverPath) {
    uniqueImages.push({
      path: normalizedCoverPath,
      altText: record.name,
    });
  }

  for (const galleryEntry of galleryEntries) {
    if (!uniqueImages.some((image) => image.path === galleryEntry.path)) {
      uniqueImages.push({
        path: galleryEntry.path,
        altText: galleryEntry.altText || buildAutomaticProductImageAlt(record.name, galleryEntry.sortOrder),
      });
    }
  }

  const resolvedImages = uniqueImages
    .map((image) => ({
      src: resolveProductMediaUrl(image.path),
      altText: image.altText || record.name,
    }))
    .filter((image): image is { src: string; altText: string } => Boolean(image.src));

  if (resolvedImages.length > 0) {
    return {
      image: resolvedImages[0].src,
      images: resolvedImages.map((image) => image.src),
      imageAlts: resolvedImages.map((image) => image.altText),
    };
  }

  const fallbackImage = PRODUCT_IMAGE_FALLBACKS[productType];

  return {
    image: fallbackImage,
    images: [fallbackImage],
    imageAlts: [record.name],
  };
}

export function adaptSupabaseProductRecord(record: SupabaseProductRecord): Product {
  const productType = record.product_type as Product["type"];
  const attributes = parseAttributes(record.attributes);
  const inventory = Array.isArray(record.inventory) ? record.inventory[0] : record.inventory;
  const media = buildProductImages(record, productType);

  return {
    id: record.id,
    slug: record.slug,
    type: productType,
    name: record.name,
    brand: record.brand?.slug ?? record.brand_slug,
    brandLabel: record.brand?.label ?? record.brand_slug,
    category: record.format?.slug ?? "general",
    categoryLabel: record.format?.label ?? "General",
    description: record.description,
    price: parseNumber(record.price),
    compareAtPrice: parseOptionalNumber(record.compare_at_price),
    stock: Math.max(inventory?.available_quantity ?? 0, 0),
    featured: record.featured,
    isPreorder: record.is_preorder,
    expansion: record.expansion?.label ?? "General",
    expansionSlug: record.expansion?.slug ?? "general",
    expansionReleaseStatus:
      (record.expansion?.release_status as Product["expansionReleaseStatus"]) ?? "live",
    format: record.format?.label ?? "General",
    formatSlug: record.format?.slug ?? "general",
    language: (record.language_code as Product["language"]) ?? "ES",
    variant: record.variant_label ?? undefined,
    rarity: attributes.rarity,
    condition: attributes.condition,
    badge: attributes.badge,
    image: media.image,
    images: media.images,
    imageAlts: media.imageAlts,
    tags: Array.isArray(record.tags) ? record.tags : [],
  };
}
