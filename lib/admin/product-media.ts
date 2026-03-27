import { Buffer } from "node:buffer";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireAdminAccess } from "@/lib/auth/admin";
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
  coverImagePath: string,
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
  galleryImagePaths: string[],
) {
  const productImagesTable = client.from("product_images") as any;
  const { error: deleteError } = await productImagesTable.delete().eq("product_id", productId);

  if (deleteError) {
    throw new Error(
      getProductMediaErrorMessage(deleteError, "No se ha podido resetear la galeria actual."),
    );
  }

  if (galleryImagePaths.length === 0) {
    return;
  }

  const rows: Database["public"]["Tables"]["product_images"]["Insert"][] = galleryImagePaths.map(
    (storagePath, index) => ({
      product_id: productId,
      storage_path: storagePath,
      alt_text: null,
      is_primary: false,
      sort_order: index + 1,
    }),
  );

  const { error: insertError } = await productImagesTable.insert(rows);

  if (insertError) {
    throw new Error(
      getProductMediaErrorMessage(insertError, "No se ha podido guardar la nueva galeria."),
    );
  }
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
  const staleCoverPaths = [...existingRootPaths].filter(
    (storagePath) =>
      storagePath.startsWith(`${productDirectory}/cover.`) && storagePath !== nextCoverPath,
  );

  await uploadToStorage(client, nextCoverPath, uploadedFile);
  await updateProductCoverPath(client, product.id, nextCoverPath);
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
      const storagePath = normalizeProductMediaPath(
        getProductGalleryImagePath(product.id, index + 1, uploadedFile.extension),
      );

      return {
        file: uploadedFile,
        storagePath,
      };
    }),
  );

  for (const item of uploadPlan) {
    await uploadToStorage(client, item.storagePath, item.file);
  }

  const galleryImagePaths = uploadPlan.map((item) => item.storagePath);
  const staleGalleryPaths = [...existingGalleryPaths].filter(
    (storagePath) => !galleryImagePaths.includes(storagePath),
  );

  await replaceProductGalleryRows(client, product.id, galleryImagePaths);
  await removeStoragePaths(client, staleGalleryPaths);

  return buildMediaMutationResult(
    product,
    normalizeProductMediaPath(product.main_image_path) || undefined,
    galleryImagePaths,
  );
}
