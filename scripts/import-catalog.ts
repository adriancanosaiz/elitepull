import fs from "node:fs/promises";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "../lib/supabase/database.types";
import {
  catalogImportSchema,
  type CatalogImport,
  type ProductImport,
} from "../lib/validators/catalog-import.ts";
import {
  getProductCoverPath,
  getProductGalleryImagePath,
} from "../lib/supabase/storage.ts";

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

function getCategoryKey(brandSlug: string, slug: string) {
  return `${brandSlug}::${slug}`;
}

function mapProductStatusToActive(product: ProductImport) {
  return product.status !== "draft";
}

async function syncProductImages(
  client: SupabaseClient<Database>,
  product: ProductImport,
) {
  const productImagesTable = client.from("product_images") as any;
  const desiredRows = product.media.gallery.map((image, index) => ({
    product_id: product.id,
    storage_path: getProductGalleryImagePath(product.id, index + 1),
    alt_text: image.alt ?? null,
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
  const categoriesTable = client.from("categories") as any;
  const productsTable = client.from("products") as any;
  const inventoryTable = client.from("inventory") as any;

  const categoryRows = catalog.categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    description: category.description,
    brand_slug: category.brandSlug,
    sort_order: category.sortOrder,
    active: category.active,
  }));

  const { error: categoriesError } = await categoriesTable.upsert(categoryRows, {
    onConflict: "id",
  });

  if (categoriesError) {
    throw new Error(`[import-catalog] Failed to upsert categories: ${categoriesError.message}`);
  }

  const { data: persistedCategories, error: persistedCategoriesError } = await categoriesTable
    .select("id, brand_slug, slug")
    .in(
      "id",
      catalog.categories.map((category) => category.id),
    );

  if (persistedCategoriesError) {
    throw new Error(
      `[import-catalog] Failed to fetch persisted categories: ${persistedCategoriesError.message}`,
    );
  }

  const categoryIdByKey = new Map<string, string>();

  for (const category of persistedCategories ?? []) {
    categoryIdByKey.set(getCategoryKey(category.brand_slug, category.slug), category.id);
  }

  const productRows = catalog.products.map((product) => {
    const categoryId = categoryIdByKey.get(getCategoryKey(product.brandSlug, product.categorySlug));

    if (!categoryId) {
      throw new Error(
        `[import-catalog] Missing category for product ${product.slug}: ${product.brandSlug}/${product.categorySlug}`,
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
      category_id: categoryId,
      price: product.price,
      compare_at_price: product.compareAtPrice ?? null,
      featured: product.featured,
      is_preorder: product.isPreorder,
      active: mapProductStatusToActive(product),
      main_image_path: getProductCoverPath(product.id),
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
    `[import-catalog] OK. categories=${catalog.categories.length} products=${catalog.products.length} galleryImages=${galleryImageCount} inventory=${inventoryRows.length}`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
