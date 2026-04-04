import { Buffer } from "node:buffer";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireAdminAccess } from "@/lib/auth/admin";
import { buildAutomaticProductImageAlt } from "@/lib/product-media-alt";
import type { Database } from "@/lib/supabase/database.types";
import {
  PRODUCT_MEDIA_BUCKET,
  getProductCoverPath,
  getProductGalleryImagePath,
  getProductMediaDirectory,
  normalizeProductMediaPath,
  resolveProductMediaUrl,
} from "@/lib/supabase/storage";

type ProductMediaUploadExtension = "webp" | "png" | "jpg" | "jpeg";

export const MAX_PRODUCT_MEDIA_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const storageEnvSchema = z.object({
  supabaseUrl: z.string().trim().url("Falta una SUPABASE URL valida."),
  serviceRoleKey: z.string().trim().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY."),
});

const allowedImageMimeTypes = new Map<string, ProductMediaUploadExtension>([
  ["image/webp", "webp"],
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
]);

const allowedImageExtensions = new Set<ProductMediaUploadExtension>([
  "webp",
  "png",
  "jpg",
  "jpeg",
]);

type ProductMediaRecord = {
  id: string;
  slug: string;
  name: string;
  brand_slug: Database["public"]["Tables"]["products"]["Row"]["brand_slug"];
  main_image_path: string | null;
};

type ProductGalleryRowRecord = Pick<
  Database["public"]["Tables"]["product_images"]["Row"],
  "id" | "storage_path" | "sort_order" | "alt_text"
>;

type DesiredGalleryRow = {
  storagePath: string;
  sortOrder: number;
  altText: string | null;
};

export type AdminProductMediaMutationResult = {
  productId: string;
  slug: string;
  brandSlug: Database["public"]["Tables"]["products"]["Row"]["brand_slug"];
  coverImagePath?: string;
  coverImageUrl?: string;
  galleryImagePaths: string[];
  galleryImageUrls: string[];
};

function getStorageEnv() {
  return storageEnvSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function createSupabaseServiceRoleClient() {
  const env = getStorageEnv();

  return createClient<Database>(env.supabaseUrl, env.serviceRoleKey, {
    db: {
      schema: "public",
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }) as SupabaseClient<Database>;
}

function getProductMediaErrorMessage(error: unknown, fallbackMessage: string) {
  if (!error || typeof error !== "object") {
    return fallbackMessage;
  }

  const maybeError = error as {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
  };

  const fullMessage = [
    maybeError.message,
    maybeError.details,
    maybeError.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (maybeError.code === "23503" && fullMessage.includes("product_images")) {
    return "La galeria no se ha podido vincular porque el producto no existe.";
  }

  if (
    maybeError.code === "23505" &&
    fullMessage.includes("product_images_product_id_storage_path_key")
  ) {
    return "La galeria contiene rutas repetidas y no se ha podido guardar.";
  }

  if (
    maybeError.code === "23505" &&
    fullMessage.includes("product_images_product_id_sort_order_key")
  ) {
    return "La galeria no se ha podido guardar por un conflicto de orden.";
  }

  if (fullMessage.includes("mime type") || fullMessage.includes("content type")) {
    return "El formato del archivo no esta permitido para esta subida.";
  }

  return fallbackMessage;
}

function getFileExtension(file: File) {
  const mimeExtension = allowedImageMimeTypes.get(file.type.toLowerCase());

  if (mimeExtension) {
    return mimeExtension;
  }

  const fileName = file.name.trim().toLowerCase();
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return null;
  }

  const extension = fileName.slice(dotIndex + 1);
  return allowedImageExtensions.has(extension as ProductMediaUploadExtension)
    ? (extension as ProductMediaUploadExtension)
    : null;
}

async function readUploadFile(
  file: File,
  label: string,
) {
  if (!(file instanceof File) || file.size <= 0) {
    throw new Error(`No se ha recibido un archivo valido para ${label}.`);
  }

  const extension = getFileExtension(file);

  if (!extension) {
    throw new Error(
      "Solo se admiten imagenes webp, png, jpg o jpeg en esta V1 del uploader.",
    );
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  if (fileBuffer.length === 0) {
    throw new Error(`El archivo de ${label} esta vacio.`);
  }

  if (file.size > MAX_PRODUCT_MEDIA_FILE_SIZE_BYTES) {
    throw new Error("Cada archivo debe pesar como maximo 8 MB en esta V1 del uploader.");
  }

  const contentType =
    file.type && allowedImageMimeTypes.has(file.type.toLowerCase())
      ? file.type.toLowerCase()
      : extension === "jpg"
        ? "image/jpeg"
        : `image/${extension}`;

  return {
    buffer: fileBuffer,
    contentType,
    extension,
  };
}

async function getProductMediaRecord(
  client: SupabaseClient<Database>,
  productId: string,
) {
  const productsTable = client.from("products") as any;
  const { data, error } = await productsTable
    .select("id, slug, name, brand_slug, main_image_path")
    .eq("id", productId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `[admin-product-media] No se pudo validar el producto: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error("El producto no existe o ya no esta disponible.");
  }

  return data as ProductMediaRecord;
}

async function listFolderPaths(
  client: SupabaseClient<Database>,
  folderPath: string,
) {
  const { data, error } = await client.storage.from(PRODUCT_MEDIA_BUCKET).list(folderPath, {
    limit: 200,
    offset: 0,
    sortBy: { column: "name", order: "asc" },
  });

  if (error && !error.message.toLowerCase().includes("not found")) {
    throw new Error(
      `[admin-product-media] No se pudo inspeccionar la carpeta ${folderPath}: ${error.message}`,
    );
  }

  const paths = new Set<string>();

  for (const item of data ?? []) {
    if (!item.id) {
      continue;
    }

    paths.add(`${folderPath}/${item.name}`);
  }

  return paths;
}

async function removeStoragePaths(
  client: SupabaseClient<Database>,
  paths: Iterable<string>,
) {
  const normalizedPaths = [...paths].filter(Boolean);

  if (normalizedPaths.length === 0) {
    return;
  }

  const { error } = await client.storage.from(PRODUCT_MEDIA_BUCKET).remove(normalizedPaths);

  if (error) {
    throw new Error(
      `[admin-product-media] No se pudieron limpiar archivos antiguos: ${error.message}`,
    );
  }
}

async function removeStoragePathsSafely(
  client: SupabaseClient<Database>,
  paths: Iterable<string>,
) {
  try {
    await removeStoragePaths(client, paths);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[admin-product-media] Limpieza compensatoria fallida: ${message}`);
  }
}

async function uploadToStorage(
  client: SupabaseClient<Database>,
  destinationPath: string,
  file: Awaited<ReturnType<typeof readUploadFile>>,
) {
  const { error } = await client.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(destinationPath, file.buffer, {
      contentType: file.contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(
      getProductMediaErrorMessage(
        error,
        `No se ha podido subir el archivo ${destinationPath}.`,
      ),
    );
  }
}

async function updateProductCoverPath(
  client: SupabaseClient<Database>,
  productId: string,
  coverImagePath: string | null,
) {
  const productsTable = client.from("products") as any;
  const { error } = await productsTable
    .update({
      main_image_path: coverImagePath,
    })
    .eq("id", productId);

  if (error) {
    throw new Error(
      getProductMediaErrorMessage(error, "No se ha podido actualizar la portada del producto."),
    );
  }
}

async function replaceProductGalleryRows(
  client: SupabaseClient<Database>,
  productId: string,
  rows: DesiredGalleryRow[],
) {
  const productImagesTable = client.from("product_images") as any;

  const { data: existingRows, error: existingRowsError } = await productImagesTable
    .select("id, storage_path, sort_order, alt_text")
    .eq("product_id", productId);

  if (existingRowsError) {
    throw new Error(
      getProductMediaErrorMessage(
        existingRowsError,
        "No se ha podido leer la galeria actual del producto.",
      ),
    );
  }

  const normalizedRows = rows.map((row) => ({
    product_id: productId,
    storage_path: row.storagePath,
    alt_text: row.altText,
    is_primary: false,
    sort_order: row.sortOrder,
  })) satisfies Database["public"]["Tables"]["product_images"]["Insert"][];

  if (normalizedRows.length > 0) {
    const { error: upsertError } = await productImagesTable.upsert(normalizedRows, {
      onConflict: "product_id,sort_order",
    });

    if (upsertError) {
      throw new Error(
        getProductMediaErrorMessage(upsertError, "No se ha podido guardar la nueva galeria."),
      );
    }
  }

  const staleRowIds =
    ((existingRows ?? []) as ProductGalleryRowRecord[])
      .filter((row) => !rows.some((desiredRow) => desiredRow.sortOrder === row.sort_order))
      .map((row) => row.id) ?? [];

  if (staleRowIds.length === 0) {
    return;
  }

  const { error: deleteError } = await productImagesTable.delete().in("id", staleRowIds);

  if (deleteError) {
    throw new Error(
      getProductMediaErrorMessage(deleteError, "No se ha podido limpiar la galeria anterior."),
    );
  }
}

async function getNextGallerySortOrder(
  client: SupabaseClient<Database>,
  productId: string,
) {
  const productImagesTable = client.from("product_images") as any;
  const { data, error } = await productImagesTable
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(
      getProductMediaErrorMessage(error, "No se ha podido preparar la siguiente imagen de galeria."),
    );
  }

  return data && data.length > 0 ? Number(data[0].sort_order) + 1 : 1;
}

async function appendProductGalleryRows(
  client: SupabaseClient<Database>,
  productId: string,
  rows: DesiredGalleryRow[],
) {
  if (rows.length === 0) return;

  const productImagesTable = client.from("product_images") as any;
  const insertRows: Database["public"]["Tables"]["product_images"]["Insert"][] = rows.map(
    (row) => ({
      product_id: productId,
      storage_path: row.storagePath,
      alt_text: row.altText,
      is_primary: false,
      sort_order: row.sortOrder,
    }),
  );

  const { error: insertError } = await productImagesTable.insert(insertRows);

  if (insertError) {
    throw new Error(
      getProductMediaErrorMessage(insertError, "No se ha podido guardar la imagen en la galeria."),
    );
  }
}

async function deleteProductGalleryRow(
  client: SupabaseClient<Database>,
  productId: string,
  storagePath: string,
) {
  const productImagesTable = client.from("product_images") as any;
  const normalizedStoragePath = normalizeProductMediaPath(storagePath);
  const { data: existingRow, error: existingRowError } = await productImagesTable
    .select("id, storage_path")
    .eq("product_id", productId)
    .eq("storage_path", normalizedStoragePath)
    .maybeSingle();

  if (existingRowError) {
    throw new Error(
      getProductMediaErrorMessage(
        existingRowError,
        "No se ha podido validar la imagen seleccionada de la galeria.",
      ),
    );
  }

  if (!existingRow) {
    throw new Error("La imagen seleccionada no pertenece a este producto o ya no existe.");
  }

  const { error: deleteError } = await productImagesTable
    .delete()
    .eq("id", existingRow.id);

  if (deleteError) {
    throw new Error(
      getProductMediaErrorMessage(deleteError, "No se ha podido eliminar la imagen de la galeria."),
    );
  }

  return normalizedStoragePath;
}

function buildMediaMutationResult(
  product: ProductMediaRecord,
  coverImagePath: string | undefined,
  galleryImagePaths: string[],
) {
  return {
    productId: product.id,
    slug: product.slug,
    brandSlug: product.brand_slug,
    coverImagePath,
    coverImageUrl: coverImagePath ? resolveProductMediaUrl(coverImagePath) : undefined,
    galleryImagePaths,
    galleryImageUrls: galleryImagePaths.map((path) => resolveProductMediaUrl(path)),
  } satisfies AdminProductMediaMutationResult;
}

export async function uploadAdminProductCover(
  productId: string,
  file: File,
) {
  await requireAdminAccess();

  const client = createSupabaseServiceRoleClient();
  const product = await getProductMediaRecord(client, productId);
  const uploadedFile = await readUploadFile(file, "la portada");
  const nextCoverPath = normalizeProductMediaPath(
    getProductCoverPath(product.id, uploadedFile.extension),
  );
  const productDirectory = getProductMediaDirectory(product.id);
  const existingRootPaths = await listFolderPaths(client, productDirectory);
  const isNewCoverPath = !existingRootPaths.has(nextCoverPath);
  const staleCoverPaths = [...existingRootPaths].filter(
    (storagePath) =>
      storagePath.startsWith(`${productDirectory}/cover.`) && storagePath !== nextCoverPath,
  );

  await uploadToStorage(client, nextCoverPath, uploadedFile);
  try {
    await updateProductCoverPath(client, product.id, nextCoverPath);
  } catch (error) {
    if (isNewCoverPath) {
      await removeStoragePathsSafely(client, [nextCoverPath]);
    }

    throw error;
  }
  await removeStoragePaths(client, staleCoverPaths);

  return buildMediaMutationResult(product, nextCoverPath, []);
}

export async function replaceAdminProductGallery(
  productId: string,
  files: File[],
) {
  await requireAdminAccess();

  if (files.length === 0) {
    throw new Error("Selecciona al menos una imagen para la galeria.");
  }

  const client = createSupabaseServiceRoleClient();
  const product = await getProductMediaRecord(client, productId);
  const galleryDirectory = `${getProductMediaDirectory(product.id)}/gallery`;
  const existingGalleryPaths = await listFolderPaths(client, galleryDirectory);

  const uploadPlan = await Promise.all(
    files.map(async (file, index) => {
      const uploadedFile = await readUploadFile(file, `la galeria #${index + 1}`);
      const sortOrder = index + 1;
      const storagePath = normalizeProductMediaPath(
        getProductGalleryImagePath(product.id, sortOrder, uploadedFile.extension),
      );

      return {
        file: uploadedFile,
        storagePath,
        sortOrder,
        altText: buildAutomaticProductImageAlt(product.name, sortOrder),
      };
    }),
  );

  for (const item of uploadPlan) {
    await uploadToStorage(client, item.storagePath, item.file);
  }

  const galleryImagePaths = uploadPlan.map((item) => item.storagePath);
  try {
    await replaceProductGalleryRows(
      client,
      product.id,
      uploadPlan.map((item) => ({
        storagePath: item.storagePath,
        sortOrder: item.sortOrder,
        altText: item.altText,
      })),
    );
  } catch (error) {
    const newOnlyPaths = uploadPlan
      .map((item) => item.storagePath)
      .filter((storagePath) => !existingGalleryPaths.has(storagePath));
    await removeStoragePathsSafely(client, newOnlyPaths);
    throw error;
  }

  const staleGalleryPaths = [...existingGalleryPaths].filter(
    (storagePath) => !galleryImagePaths.includes(storagePath),
  );
  await removeStoragePaths(client, staleGalleryPaths);

  return buildMediaMutationResult(
    product,
    normalizeProductMediaPath(product.main_image_path) || undefined,
    galleryImagePaths,
  );
}

export async function deleteAdminProductCover(productId: string) {
  await requireAdminAccess();

  const client = createSupabaseServiceRoleClient();
  const product = await getProductMediaRecord(client, productId);
  const currentPath = normalizeProductMediaPath(product.main_image_path) || undefined;

  if (currentPath) {
    await updateProductCoverPath(client, product.id, null);
    await removeStoragePaths(client, [currentPath]);
  }

  // No gallery modifications needed; we return empty array since this just handles the cover
  return buildMediaMutationResult(product, undefined, []);
}

export async function deleteAdminProductGalleryImage(productId: string, storagePath: string) {
  await requireAdminAccess();

  const client = createSupabaseServiceRoleClient();
  const product = await getProductMediaRecord(client, productId);
  const normalizedStoragePath = normalizeProductMediaPath(storagePath);
  const productGalleryDirectory = `${getProductMediaDirectory(product.id)}/gallery/`;

  if (!normalizedStoragePath.startsWith(productGalleryDirectory)) {
    throw new Error("La imagen seleccionada no pertenece a la galeria de este producto.");
  }

  const deletedStoragePath = await deleteProductGalleryRow(client, product.id, normalizedStoragePath);
  await removeStoragePaths(client, [deletedStoragePath]);

  // Just return empty, it's enough for revalidation
  return buildMediaMutationResult(
    product,
    normalizeProductMediaPath(product.main_image_path) || undefined,
    [],
  );
}

export async function appendAdminProductGalleryImages(productId: string, files: File[]) {
  await requireAdminAccess();

  if (files.length === 0) {
    throw new Error("Selecciona al menos una imagen para la galeria.");
  }

  const client = createSupabaseServiceRoleClient();
  const product = await getProductMediaRecord(client, productId);
  const nextSortOrder = await getNextGallerySortOrder(client, product.id);

  const uploadPlan = await Promise.all(
    files.map(async (file, index) => {
      const uploadedFile = await readUploadFile(file, `nueva imagen de galeria`);
      const sortOrder = nextSortOrder + index;
      const storagePath = normalizeProductMediaPath(
        getProductGalleryImagePath(product.id, sortOrder, uploadedFile.extension),
      );

      return {
        file: uploadedFile,
        storagePath,
        sortOrder,
        altText: buildAutomaticProductImageAlt(product.name, sortOrder),
      };
    }),
  );

  for (const item of uploadPlan) {
    await uploadToStorage(client, item.storagePath, item.file);
  }

  const galleryImagePaths = uploadPlan.map((item) => item.storagePath);
  try {
    await appendProductGalleryRows(
      client,
      product.id,
      uploadPlan.map((item) => ({
        storagePath: item.storagePath,
        sortOrder: item.sortOrder,
        altText: item.altText,
      })),
    );
  } catch (error) {
    await removeStoragePathsSafely(client, galleryImagePaths);
    throw error;
  }

  return buildMediaMutationResult(
    product,
    normalizeProductMediaPath(product.main_image_path) || undefined,
    galleryImagePaths,
  );
}
