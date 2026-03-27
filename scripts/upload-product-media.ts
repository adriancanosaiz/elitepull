import fs from "node:fs/promises";
import path from "node:path";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { Database } from "../lib/supabase/database.types";
import {
  catalogImportSchema,
  type CatalogImport,
} from "../lib/validators/catalog-import.ts";
import {
  PRODUCT_MEDIA_BUCKET,
  getProductCoverPath,
  getProductGalleryImagePath,
  getProductMediaDirectory,
} from "../lib/supabase/storage.ts";

const envSchema = z.object({
  supabaseUrl: z.string().trim().url("Missing valid SUPABASE URL"),
  serviceRoleKey: z.string().trim().min(1, "Missing SUPABASE_SERVICE_ROLE_KEY"),
});

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function shouldOverwrite() {
  return process.argv.includes("--overwrite");
}

function shouldDeleteOrphans() {
  return process.argv.includes("--delete-orphans");
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

async function readRequiredFile(filePath: string, label: string) {
  try {
    return await fs.readFile(filePath);
  } catch {
    throw new Error(`[upload-product-media] Missing ${label}: ${filePath}`);
  }
}

async function uploadFile(
  client: SupabaseClient<Database>,
  bucket: string,
  destinationPath: string,
  fileBuffer: Buffer,
  overwrite: boolean,
) {
  const { error } = await client.storage.from(bucket).upload(destinationPath, fileBuffer, {
    contentType: "image/webp",
    upsert: overwrite,
  });

  if (error) {
    throw new Error(`[upload-product-media] Failed to upload ${destinationPath}: ${error.message}`);
  }
}

async function collectExistingProductPaths(
  client: SupabaseClient<Database>,
  productId: string,
) {
  const productDirectory = getProductMediaDirectory(productId);
  const bucket = client.storage.from(PRODUCT_MEDIA_BUCKET);

  const { data: rootItems, error: rootError } = await bucket.list(productDirectory, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (rootError) {
    throw new Error(
      `[upload-product-media] Failed to inspect root media for ${productId}: ${rootError.message}`,
    );
  }

  const { data: galleryItems, error: galleryError } = await bucket.list(`${productDirectory}/gallery`, {
    limit: 100,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (galleryError && !galleryError.message.toLowerCase().includes("not found")) {
    throw new Error(
      `[upload-product-media] Failed to inspect gallery media for ${productId}: ${galleryError.message}`,
    );
  }

  const paths = new Set<string>();

  for (const item of rootItems ?? []) {
    if (!item.id) {
      continue;
    }

    paths.add(`${productDirectory}/${item.name}`);
  }

  for (const item of galleryItems ?? []) {
    if (!item.id) {
      continue;
    }

    paths.add(`${productDirectory}/gallery/${item.name}`);
  }

  return paths;
}

async function deleteOrphanPaths(
  client: SupabaseClient<Database>,
  productId: string,
  expectedPaths: Set<string>,
) {
  const existingPaths = await collectExistingProductPaths(client, productId);
  const orphanPaths = [...existingPaths].filter((storagePath) => !expectedPaths.has(storagePath));

  if (orphanPaths.length === 0) {
    return 0;
  }

  const { error } = await client.storage.from(PRODUCT_MEDIA_BUCKET).remove(orphanPaths);

  if (error) {
    throw new Error(
      `[upload-product-media] Failed to delete orphan media for ${productId}: ${error.message}`,
    );
  }

  return orphanPaths.length;
}

async function main() {
  const catalogFilePath = getCatalogFilePath();
  const overwrite = shouldOverwrite();
  const deleteOrphans = shouldDeleteOrphans();
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

  let uploadedFiles = 0;
  let deletedFiles = 0;

  for (const product of catalog.products) {
    const localProductMediaDir = path.join(process.cwd(), "catalog", "media", product.slug);
    const expectedPaths = new Set<string>();

    const coverStoragePath = getProductCoverPath(product.id);
    expectedPaths.add(coverStoragePath);

    const localCoverPath = path.join(localProductMediaDir, product.media.coverFile);
    const coverBuffer = await readRequiredFile(localCoverPath, `cover for ${product.slug}`);

    await uploadFile(client, PRODUCT_MEDIA_BUCKET, coverStoragePath, coverBuffer, overwrite);
    uploadedFiles += 1;

    for (const [index, image] of product.media.gallery.entries()) {
      const galleryStoragePath = getProductGalleryImagePath(product.id, index + 1);
      expectedPaths.add(galleryStoragePath);

      const localGalleryPath = path.join(localProductMediaDir, image.file);
      const galleryBuffer = await readRequiredFile(
        localGalleryPath,
        `gallery image ${image.file} for ${product.slug}`,
      );

      await uploadFile(
        client,
        PRODUCT_MEDIA_BUCKET,
        galleryStoragePath,
        galleryBuffer,
        overwrite,
      );
      uploadedFiles += 1;
    }

    if (deleteOrphans) {
      deletedFiles += await deleteOrphanPaths(client, product.id, expectedPaths);
    }
  }

  console.log(
    `[upload-product-media] OK. files=${uploadedFiles} bucket=${PRODUCT_MEDIA_BUCKET} overwrite=${overwrite} deleteOrphans=${deleteOrphans} deleted=${deletedFiles}`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
