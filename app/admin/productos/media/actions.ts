"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  replaceAdminProductGallery,
  uploadAdminProductCover,
  type AdminProductMediaMutationResult,
} from "@/lib/admin/product-media";

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

export async function uploadAdminProductCoverAction(productId: string, formData: FormData) {
  const safeProductId = typeof productId === "string" && productId.trim() ? productId : undefined;
  let targetPath = getEditProductPath(safeProductId);

  try {
    if (!safeProductId) {
      throw new Error("No se ha podido identificar el producto para subir la portada.");
    }

    const coverFile = formData.get("coverImage");
    const result = await uploadAdminProductCover(safeProductId, coverFile as File);

    revalidateAdminProductMediaPaths(result);
    targetPath = buildRedirectUrl(getEditProductPath(safeProductId), {
      mediaSuccess: "cover-uploaded",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getEditProductPath(safeProductId), {
      mediaError: getMediaActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function replaceAdminProductGalleryAction(productId: string, formData: FormData) {
  const safeProductId = typeof productId === "string" && productId.trim() ? productId : undefined;
  let targetPath = getEditProductPath(safeProductId);

  try {
    if (!safeProductId) {
      throw new Error("No se ha podido identificar el producto para reemplazar la galeria.");
    }

    const galleryFiles = formData
      .getAll("galleryImages")
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);
    const result = await replaceAdminProductGallery(safeProductId, galleryFiles);

    revalidateAdminProductMediaPaths(result);
    targetPath = buildRedirectUrl(getEditProductPath(safeProductId), {
      mediaSuccess: "gallery-replaced",
    });
  } catch (error) {
    targetPath = buildRedirectUrl(getEditProductPath(safeProductId), {
      mediaError: getMediaActionErrorMessage(error),
    });
  }

  redirect(targetPath);
}
