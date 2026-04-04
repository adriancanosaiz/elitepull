import fs from "node:fs/promises";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "../lib/supabase/database.types";
import { buildAutomaticProductImageAlt } from "../lib/product-media-alt.ts";
import {
  catalogImportSchema,
  type CatalogImport,
  type ProductImport,
} from "../lib/validators/catalog-import.ts";
import {
  getProductCoverPath,
  getProductGalleryImagePath,
} from "../lib/supabase/storage.ts";

type ProductMediaExtension = "webp" | "png" | "jpg" | "jpeg" | "avif";

const envSchema = z.object({
  supabaseUrl: z.string().trim().url("Missing valid SUPABASE URL"),
  serviceRoleKey: z.string().trim().min(1, "Missing SUPABASE_SERVICE_ROLE_KEY"),
});

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function getCatalogFilePath() {
  const customPath = getArgValue("--file");
  return customPath
    ? path.resolve(process.cwd(), customPath)
    : path.join(process.cwd(), "catalog", "catalog.json");
}

function getEnv() {
  return envSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

async function readCatalog(filePath: string) {
  const file = await fs.readFile(filePath, "utf8");
  return catalogImportSchema.parse(JSON.parse(file)) as CatalogImport;
}

function mapProductStatusToActive(product: ProductImport) {
  return product.status !== "draft";
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function buildExpansionSlug(value: string | undefined) {
  if (!value) {
    return "general";
  }

  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "general"
  );
}

function resolveProductLanguage(product: ProductImport) {
  const rawLanguage = normalizeOptionalString(product.attributes.language)?.toUpperCase();

  if (rawLanguage === "ES" || rawLanguage === "EN" || rawLanguage === "JP") {
    return rawLanguage;
  }

  return "ES";
}

function resolveVariantLabel(product: ProductImport) {
  return (
    normalizeOptionalString(product.attributes.variantLabel) ??
    normalizeOptionalString(product.attributes.variant_label) ??
    normalizeOptionalString(product.attributes.variant)
  );
}

function resolveImageExtension(fileName: string): ProductMediaExtension {
  const extension = path.extname(fileName).replace(/^\./, "").toLowerCase();

  if (
    extension === "webp" ||
    extension === "png" ||
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "avif"
  ) {
    return extension;
  }

  throw new Error(`[import-catalog] Unsupported image extension: ${fileName}`);
}

async function syncProductImages(
  client: SupabaseClient<Database>,
  product: ProductImport,
) {
  const productImagesTable = client.from("product_images") as any;
  const desiredRows = product.media.gallery.map((image, index) => ({
    product_id: product.id,
    storage_path: getProductGalleryImagePath(
      product.id,
      index + 1,
      resolveImageExtension(image.file),
    ),
    alt_text: buildAutomaticProductImageAlt(product.name, index + 1),
    sort_order: index + 1,
    is_primary: false,
  }));

  const desiredPaths = new Set(desiredRows.map((row) => row.storage_path));

  const { data: existingRows, error: existingRowsError } = await productImagesTable
    .select("id, storage_path")
    .eq("product_id", product.id);

  if (existingRowsError) {
    throw new Error(
      `[import-catalog] Failed to read gallery for ${product.slug}: ${existingRowsError.message}`,
    );
  }

  const staleIds =
    existingRows
      ?.filter((row: { id: string; storage_path: string }) => !desiredPaths.has(row.storage_path))
      .map((row: { id: string; storage_path: string }) => row.id) ?? [];

  if (staleIds.length > 0) {
    const { error: deleteError } = await productImagesTable.delete().in("id", staleIds);

    if (deleteError) {
      throw new Error(
        `[import-catalog] Failed to delete stale gallery rows for ${product.slug}: ${deleteError.message}`,
      );
    }
  }

  if (desiredRows.length > 0) {
    const { error: upsertError } = await productImagesTable.upsert(desiredRows, {
      onConflict: "product_id,storage_path",
    });

    if (upsertError) {
      throw new Error(
        `[import-catalog] Failed to upsert gallery for ${product.slug}: ${upsertError.message}`,
      );
    }
  }

  return desiredRows.length;
}

async function main() {
  const catalogFilePath = getCatalogFilePath();
  const env = getEnv();
  const catalog = await readCatalog(catalogFilePath);

  const client = createClient(env.supabaseUrl, env.serviceRoleKey, {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as SupabaseClient<Database>;
  const productsTable = client.from("products") as any;
  const inventoryTable = client.from("inventory") as any;
  const [{ data: brands, error: brandsError }, { data: formats, error: formatsError }, { data: expansions, error: expansionsError }, { data: languages, error: languagesError }] =
    await Promise.all([
      client.from("brands").select("id, slug").eq("active", true),
      client.from("product_formats").select("id, slug").eq("active", true),
      client.from("expansions").select("id, brand_id, slug").eq("active", true),
      client.from("product_languages").select("code").eq("active", true),
    ]);

  if (brandsError) {
    throw new Error(`[import-catalog] Failed to read brands: ${brandsError.message}`);
  }

  if (formatsError) {
    throw new Error(`[import-catalog] Failed to read formats: ${formatsError.message}`);
  }

  if (expansionsError) {
    throw new Error(`[import-catalog] Failed to read expansions: ${expansionsError.message}`);
  }

  if (languagesError) {
    throw new Error(`[import-catalog] Failed to read languages: ${languagesError.message}`);
  }

  const brandRows = (brands ?? []) as Array<Pick<Database["public"]["Tables"]["brands"]["Row"], "id" | "slug">>;
  const formatRows = (formats ?? []) as Array<
    Pick<Database["public"]["Tables"]["product_formats"]["Row"], "id" | "slug">
  >;
  const expansionRows = (expansions ?? []) as Array<
    Pick<Database["public"]["Tables"]["expansions"]["Row"], "id" | "brand_id" | "slug">
  >;
  const languageRows = (languages ?? []) as Array<
    Pick<Database["public"]["Tables"]["product_languages"]["Row"], "code">
  >;

  const brandIdBySlug = new Map(brandRows.map((brand) => [brand.slug, brand.id]));
  const formatIdBySlug = new Map(formatRows.map((format) => [format.slug, format.id]));
  const expansionIdByKey = new Map(
    expansionRows.map((expansion) => [`${expansion.brand_id}::${expansion.slug}`, expansion.id]),
  );
  const activeLanguageCodes = new Set(languageRows.map((language) => language.code));

  const productRows = catalog.products.map((product) => {
    const brandId = brandIdBySlug.get(product.brandSlug);
    const formatId = formatIdBySlug.get(product.formatSlug);
    const expansionSlug = buildExpansionSlug(
      normalizeOptionalString(product.attributes.expansion) ?? "General",
    );
    const languageCode = resolveProductLanguage(product);
    const expansionId = brandId ? expansionIdByKey.get(`${brandId}::${expansionSlug}`) : undefined;

    if (!brandId) {
      throw new Error(
        `[import-catalog] Missing active brand for product ${product.slug}: ${product.brandSlug}`,
      );
    }

    if (!formatId) {
      throw new Error(
        `[import-catalog] Missing active format for product ${product.slug}: ${product.formatSlug}`,
      );
    }

    if (!expansionId) {
      throw new Error(
        `[import-catalog] Missing active expansion for product ${product.slug}: ${product.brandSlug}/${expansionSlug}`,
      );
    }

    if (!activeLanguageCodes.has(languageCode)) {
      throw new Error(
        `[import-catalog] Missing active language for product ${product.slug}: ${languageCode}`,
      );
    }

    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      description: product.description,
      product_type: product.productType,
      brand_slug: product.brandSlug,
      brand_id: brandId,
      expansion_id: expansionId,
      format_id: formatId,
      language_code: languageCode,
      variant_label: resolveVariantLabel(product) ?? null,
      price: product.price,
      compare_at_price: product.compareAtPrice ?? null,
      featured: product.featured,
      is_preorder: product.isPreorder,
      active: mapProductStatusToActive(product),
      main_image_path: getProductCoverPath(
        product.id,
        resolveImageExtension(product.media.coverFile),
      ),
      attributes: product.attributes,
      tags: product.tags,
    };
  });

  const { error: productsError } = await productsTable.upsert(productRows, {
    onConflict: "id",
  });

  if (productsError) {
    throw new Error(`[import-catalog] Failed to upsert products: ${productsError.message}`);
  }

  let galleryImageCount = 0;

  for (const product of catalog.products) {
    galleryImageCount += await syncProductImages(client, product);
  }

  const inventoryRows = catalog.products.map((product) => ({
    product_id: product.id,
    available_quantity: product.stock,
  }));

  const { error: inventoryError } = await inventoryTable.upsert(inventoryRows, {
    onConflict: "product_id",
  });

  if (inventoryError) {
    throw new Error(`[import-catalog] Failed to upsert inventory: ${inventoryError.message}`);
  }

  console.log(
    `[import-catalog] OK. products=${catalog.products.length} galleryImages=${galleryImageCount} inventory=${inventoryRows.length}`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
