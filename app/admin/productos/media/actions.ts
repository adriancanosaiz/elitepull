"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  replaceAdminProductGallery,
  uploadAdminProductCover,
  type AdminProductMediaMutationResult,
} from "@/lib/admin/product-media";
import { createUuidLikeSchema } from "@/lib/validators/uuid-like";

const adminProductMediaIdSchema = createUuidLikeSchema("El id de producto no es valido.");

function buildRedirectUrl(basePath: string, params: Record<string, string | undefined>) {
  const [pathname, rawQuery = ""] = basePath.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  searchParams.delete("mediaError");
  searchParams.delete("mediaSuccess");

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getMediaActionErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.replace(/^\[[^\]]+\]\s*/, "");
  }

  return "Ha ocurrido un error inesperado durante la subida.";
}

function getEditProductPath(productId?: string) {
  return productId ? `/admin/productos/${productId}` : "/admin/productos";
}

function resolveAdminProductMediaId(formData: FormData) {
  const parsedProductId = adminProductMediaIdSchema.safeParse(formData.get("productId"));

  if (parsedProductId.success) {
    return parsedProductId.data;
  }

  throw new Error("El id de producto no es valido.");
}

function revalidateAdminProductMediaPaths(result: AdminProductMediaMutationResult) {
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${result.productId}`);
  revalidatePath(`/producto/${result.slug}`);
  revalidatePath("/catalogo");
  revalidatePath("/");

  if (result.brandSlug === "accesorios") {
    revalidatePath("/accesorios");
    return;
  }

  revalidatePath(`/marca/${result.brandSlug}`);
}

export async function uploadAdminProductCoverAction(formData: FormData) {
  const requestedId =
    typeof formData.get("productId") === "string"
      ? String(formData.get("productId"))
      : undefined;
  const safeProductId = requestedId?.trim() || undefined;
  let targetPath = getEditProductPath(safeProductId);

  try {
    const resolvedProductId = resolveAdminProductMediaId(formData);

    const coverFile = formData.get("coverImage");
    const result = await uploadAdminProductCover(resolvedProductId, coverFile as File);

    revalidateAdminProductMediaPaths(result);
    targetPath = buildRedirectUrl(getEditProductPath(resolvedProductId), {
      mediaSuccess: "cover-uploaded",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getEditProductPath(safeProductId), {
      mediaError: getMediaActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function replaceAdminProductGalleryAction(formData: FormData) {
  const requestedId =
    typeof formData.get("productId") === "string"
      ? String(formData.get("productId"))
      : undefined;
  const safeProductId = requestedId?.trim() || undefined;
  let targetPath = getEditProductPath(safeProductId);

  try {
    const resolvedProductId = resolveAdminProductMediaId(formData);

    const galleryFiles = formData
      .getAll("galleryImages")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const result = await replaceAdminProductGallery(resolvedProductId, galleryFiles);

    revalidateAdminProductMediaPaths(result);
    targetPath = buildRedirectUrl(getEditProductPath(resolvedProductId), {
      mediaSuccess: "gallery-replaced",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getEditProductPath(safeProductId), {
      mediaError: getMediaActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}
