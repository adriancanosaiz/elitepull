import { hasSupabaseEnv } from "./client";

export const PRODUCT_MEDIA_BUCKET = "product-media";
export const PRODUCT_MEDIA_ROOT = "products";

type ProductMediaExtension = "webp" | "png" | "jpg" | "jpeg" | "avif";

function sanitizePathSegment(value: string) {
  return value.trim().replace(/^\/+|\/+$/g, "");
}

export function getProductMediaDirectory(productId: string) {
  return `${PRODUCT_MEDIA_ROOT}/${sanitizePathSegment(productId)}`;
}

export function getProductCoverPath(
  productId: string,
  extension: ProductMediaExtension = "webp",
) {
  return `${getProductMediaDirectory(productId)}/cover.${extension}`;
}

export function getProductGalleryImagePath(
  productId: string,
  index: number,
  extension: ProductMediaExtension = "webp",
) {
  return `${getProductMediaDirectory(productId)}/gallery/${String(index).padStart(2, "0")}.${extension}`;
}

export function normalizeProductMediaPath(path?: string | null) {
  if (!path?.trim()) {
    return "";
  }

  const trimmedPath = path.trim();

  if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
    const bucketMarker = `/storage/v1/object/public/${PRODUCT_MEDIA_BUCKET}/`;
    const markerIndex = trimmedPath.indexOf(bucketMarker);

    if (markerIndex === -1) {
      return trimmedPath;
    }

    return trimmedPath.slice(markerIndex + bucketMarker.length);
  }

  if (trimmedPath.startsWith("/storage/v1/object/public/")) {
    const bucketPrefix = `/storage/v1/object/public/${PRODUCT_MEDIA_BUCKET}/`;
    return trimmedPath.startsWith(bucketPrefix)
      ? trimmedPath.slice(bucketPrefix.length)
      : trimmedPath;
  }

  const normalizedPath = trimmedPath.replace(/^\/+/, "");

  if (normalizedPath.startsWith(`${PRODUCT_MEDIA_BUCKET}/`)) {
    return normalizedPath.slice(PRODUCT_MEDIA_BUCKET.length + 1);
  }

  return normalizedPath;
}

export function resolveProductMediaUrl(path?: string | null) {
  if (!path?.trim()) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (path.startsWith("/") && !path.startsWith("/storage/v1/object/public/")) {
    return path;
  }

  const normalizedPath = normalizeProductMediaPath(path);

  if (!normalizedPath) {
    return "";
  }

  if (!hasSupabaseEnv()) {
    return `/${normalizedPath}`;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");

  return `${baseUrl}/storage/v1/object/public/${PRODUCT_MEDIA_BUCKET}/${normalizedPath}`;
}
