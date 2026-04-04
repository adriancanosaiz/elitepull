"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createAdminProduct,
  deleteAdminProduct,
  toggleAdminProductActive,
  updateAdminProduct,
  updateAdminProductStock,
  type AdminProductMutationResult,
} from "@/lib/admin/products";
import {
  replaceAdminProductGallery,
  uploadAdminProductCover,
  deleteAdminProductCover,
  deleteAdminProductGalleryImage,
  appendAdminProductGalleryImages,
  type AdminProductMediaMutationResult,
} from "@/lib/admin/product-media";
import { adminProductSchema } from "@/lib/validators/admin-product";
import { createUuidLikeSchema } from "@/lib/validators/uuid-like";

const toggleActiveSchema = z.object({
  productId: createUuidLikeSchema("El id de producto no es valido."),
  nextActive: z.preprocess(
    (value) => value === true || value === "true" || value === "on",
    z.boolean(),
  ),
});

const updateStockSchema = z.object({
  productId: createUuidLikeSchema("El id de producto no es valido."),
  stock: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        const trimmedValue = value.trim();
        return trimmedValue ? Number(trimmedValue) : value;
      }

      return value;
    },
    z
      .number()
      .int("El stock debe ser un entero.")
      .nonnegative("El stock no puede ser negativo."),
  ),
});

const adminProductIdSchema = createUuidLikeSchema("El id de producto no es valido.");

function buildRedirectUrl(basePath: string, params: Record<string, string | undefined>) {
  const [pathname, rawQuery = ""] = basePath.split("?");
  const searchParams = new URLSearchParams(rawQuery);

  searchParams.delete("error");
  searchParams.delete("success");

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

function getFirstErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];

    if (!firstIssue) {
      return "Revisa los campos del formulario.";
    }

    if (
      firstIssue.message.toLowerCase().includes("expected string") ||
      firstIssue.message.toLowerCase().includes("received null")
    ) {
      const fieldPath = String(firstIssue.path[0] ?? "");
      const fieldLabels: Record<string, string> = {
        name: "nombre",
        description: "descripcion",
        productType: "tipo de producto",
        brandId: "marca",
        expansionId: "expansion",
        formatId: "formato",
        languageCode: "idioma",
        price: "precio",
        stock: "stock",
      };

      if (fieldLabels[fieldPath]) {
        return `Revisa el campo ${fieldLabels[fieldPath]}.`;
      }
    }

    return firstIssue.message;
  }

  if (error instanceof Error) {
    return error.message.replace(/^\[[^\]]+\]\s*/, "");
  }

  return "Ha ocurrido un error inesperado.";
}

function getFormFieldValue(formData: FormData, key: string) {
  const values = formData
    .getAll(key)
    .map((entry) => (typeof entry === "string" ? entry : ""))
    .filter((value) => value.length > 0);

  if (values.length > 1) {
    return values;
  }

  return formData.get(key);
}

function getRedirectTo(formData: FormData, fallbackPath: string) {
  const redirectTo = formData.get("redirectTo");
  return typeof redirectTo === "string" && redirectTo.trim() ? redirectTo : fallbackPath;
}

function getUploadedFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function getUploadedFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);
}

function parseAdminProductFormData(formData: FormData, forcedId?: string) {
  return adminProductSchema.parse({
    id: forcedId ?? formData.get("productId"),
    name: formData.get("name"),
    description: formData.get("description"),
    productType: formData.get("productType"),
    brandId: formData.get("brandId"),
    expansionId: formData.get("expansionId"),
    formatId: formData.get("formatId"),
    languageCode: formData.get("languageCode"),
    variantLabel: formData.get("variantLabel"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    featured: formData.get("featured"),
    isPreorder: formData.get("isPreorder"),
    active: formData.get("active"),
    stock: formData.get("stock"),
    tags: getFormFieldValue(formData, "tags"),
    attributes: {
      rarity: formData.get("rarity"),
      condition: formData.get("condition"),
      badge: formData.get("badge"),
    },
    coverImagePath: formData.has("coverImagePath") ? formData.get("coverImagePath") : undefined,
    galleryImagePaths: formData.has("galleryImagePaths")
      ? getFormFieldValue(formData, "galleryImagePaths")
      : undefined,
  });
}

function resolveAdminProductId(formData: FormData) {
  const parsedProductId = adminProductIdSchema.safeParse(formData.get("productId"));

  if (parsedProductId.success) {
    return parsedProductId.data;
  }

  throw new z.ZodError([
    {
      code: "custom",
      message: "El id de producto no es valido.",
      path: ["id"],
    },
  ]);
}

function revalidateAdminProductPaths(result: AdminProductMutationResult) {
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${result.id}`);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/preventa");
  revalidatePath("/marca/pokemon");
  revalidatePath("/marca/one-piece");
  revalidatePath("/marca/riftbound");
  revalidatePath("/marca/magic");
  revalidatePath("/accesorios");

  if (result.brandSlug === "accesorios" && result.categorySlug) {
    revalidatePath(`/accesorios/${result.categorySlug}`);
  } else if (result.categorySlug) {
    revalidatePath(`/marca/${result.brandSlug}/${result.categorySlug}`);
  }

  revalidatePath(`/producto/${result.slug}`);
}

export async function createAdminProductAction(formData: FormData) {
  let targetPath = "/admin/productos/nuevo";
  let createdProduct: AdminProductMutationResult | null = null;

  try {
    const input = parseAdminProductFormData(formData);
    const coverImage = getUploadedFile(formData, "coverImage");
    const galleryImages = getUploadedFiles(formData, "galleryImages");
    const result = await createAdminProduct(input);

    createdProduct = result;
    revalidateAdminProductPaths(result);

    if (coverImage) {
      await uploadAdminProductCover(result.id, coverImage);
    }

    if (galleryImages.length > 0) {
      await replaceAdminProductGallery(result.id, galleryImages);
    }

    revalidateAdminProductPaths(result);
    targetPath = buildRedirectUrl("/admin/productos", {
      success: coverImage || galleryImages.length > 0 ? "created-with-media" : "created",
    });
  } catch (error) {
    if (createdProduct) {
      targetPath = buildRedirectUrl("/admin/productos", {
        success: "created",
        error: `Producto creado, pero la subida inicial de media no ha terminado bien: ${getFirstErrorMessage(error)}`,
      });
    } else {
      targetPath = buildRedirectUrl("/admin/productos/nuevo", {
        error: getFirstErrorMessage(error),
      });
    }
  }

  redirect(targetPath);
}

export async function updateAdminProductAction(formData: FormData) {
  const requestedId =
    typeof formData.get("productId") === "string"
      ? String(formData.get("productId")).trim()
      : "";
  const fallbackId = requestedId || "producto";
  let targetPath = `/admin/productos/${fallbackId}`;

  try {
    const resolvedProductId = resolveAdminProductId(formData);
    const input = parseAdminProductFormData(formData, resolvedProductId);
    const result = await updateAdminProduct(input);

    revalidateAdminProductPaths(result);
    targetPath = buildRedirectUrl(`/admin/productos/${result.id}`, { success: "updated" });
  } catch (error) {
    targetPath = buildRedirectUrl(
      `/admin/productos/${fallbackId}`,
      {
        error: getFirstErrorMessage(error),
      },
    );
  }

  redirect(targetPath);
}

export async function toggleAdminProductActiveAction(formData: FormData) {
  const redirectTo = getRedirectTo(formData, "/admin/productos");
  let targetPath = redirectTo;

  try {
    const parsedPayload = toggleActiveSchema.parse({
      productId: formData.get("productId"),
      nextActive: formData.get("nextActive"),
    });

    const result = await toggleAdminProductActive(
      parsedPayload.productId,
      parsedPayload.nextActive,
    );

    revalidateAdminProductPaths(result);
    targetPath = buildRedirectUrl(redirectTo, { success: "status-updated" });
  } catch (error) {
    targetPath = buildRedirectUrl(redirectTo, {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function updateAdminProductStockAction(formData: FormData) {
  const redirectTo = getRedirectTo(formData, "/admin/productos");
  let targetPath = redirectTo;

  try {
    const parsedPayload = updateStockSchema.parse({
      productId: formData.get("productId"),
      stock: formData.get("stock"),
    });

    const result = await updateAdminProductStock(parsedPayload.productId, parsedPayload.stock);

    revalidateAdminProductPaths(result);
    targetPath = buildRedirectUrl(redirectTo, { success: "stock-updated" });
  } catch (error) {
    targetPath = buildRedirectUrl(redirectTo, {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function deleteAdminProductAction(formData: FormData) {
  const requestedId =
    typeof formData.get("productId") === "string"
      ? String(formData.get("productId")).trim()
      : "";
  const redirectTo = getRedirectTo(
    formData,
    requestedId ? `/admin/productos/${requestedId}` : "/admin/productos",
  );
  let targetPath = redirectTo;

  try {
    const productId = resolveAdminProductId(formData);
    const result = await deleteAdminProduct(productId);

    revalidateAdminProductPaths(result);
    targetPath = buildRedirectUrl("/admin/productos", { success: "deleted" });
  } catch (error) {
    targetPath = buildRedirectUrl(redirectTo, {
      error: getFirstErrorMessage(error),
    });
  }
  redirect(targetPath);
}

function revalidateAdminMediaPaths(result: AdminProductMediaMutationResult) {
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath(`/admin/productos/${result.productId}`);
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/preventa");
  revalidatePath("/marca/pokemon");
  revalidatePath("/marca/one-piece");
  revalidatePath("/marca/riftbound");
  revalidatePath("/marca/magic");
  revalidatePath("/accesorios");
  revalidatePath(`/producto/${result.slug}`);
}

export async function uploadStandaloneAdminProductCoverAction(formData: FormData) {
  const requestedId = typeof formData.get("productId") === "string" ? String(formData.get("productId")).trim() : "";
  let targetPath = requestedId ? `/admin/productos/${requestedId}` : "/admin/productos";

  try {
    const productId = resolveAdminProductId(formData);
    const coverImage = getUploadedFile(formData, "coverImage");
    if (!coverImage) throw new Error("Selecciona una imagen de portada valida.");

    const result = await uploadAdminProductCover(productId, coverImage);
    revalidateAdminMediaPaths(result);
    targetPath = buildRedirectUrl(targetPath, { success: "cover-uploaded" });
  } catch (error) {
    targetPath = buildRedirectUrl(targetPath, { error: getFirstErrorMessage(error) });
  }

  redirect(targetPath);
}

export async function deleteAdminProductCoverAction(formData: FormData) {
  const requestedId = typeof formData.get("productId") === "string" ? String(formData.get("productId")).trim() : "";
  let targetPath = requestedId ? `/admin/productos/${requestedId}` : "/admin/productos";

  try {
    const productId = resolveAdminProductId(formData);
    const result = await deleteAdminProductCover(productId);
    
    revalidateAdminMediaPaths(result);
    targetPath = buildRedirectUrl(targetPath, { success: "cover-deleted" });
  } catch (error) {
    targetPath = buildRedirectUrl(targetPath, { error: getFirstErrorMessage(error) });
  }

  redirect(targetPath);
}

export async function appendAdminProductGalleryImagesAction(formData: FormData) {
  const requestedId = typeof formData.get("productId") === "string" ? String(formData.get("productId")).trim() : "";
  let targetPath = requestedId ? `/admin/productos/${requestedId}` : "/admin/productos";

  try {
    const productId = resolveAdminProductId(formData);
    const galleryImages = getUploadedFiles(formData, "galleryImages");
    
    if (galleryImages.length === 0) throw new Error("Selecciona al menos una imagen valida para la galeria.");

    const result = await appendAdminProductGalleryImages(productId, galleryImages);
    revalidateAdminMediaPaths(result);
    targetPath = buildRedirectUrl(targetPath, { success: "gallery-updated" });
  } catch (error) {
    targetPath = buildRedirectUrl(targetPath, { error: getFirstErrorMessage(error) });
  }

  redirect(targetPath);
}

export async function deleteAdminProductGalleryImageAction(formData: FormData) {
  const requestedId = typeof formData.get("productId") === "string" ? String(formData.get("productId")).trim() : "";
  let targetPath = requestedId ? `/admin/productos/${requestedId}` : "/admin/productos";

  try {
    const productId = resolveAdminProductId(formData);
    const storagePath = formData.get("storagePath");
    if (typeof storagePath !== "string" || !storagePath) throw new Error("Falta la ruta original de la imagen.");

    const result = await deleteAdminProductGalleryImage(productId, storagePath);
    revalidateAdminMediaPaths(result);
    targetPath = buildRedirectUrl(targetPath, { success: "gallery-image-deleted" });
  } catch (error) {
    targetPath = buildRedirectUrl(targetPath, { error: getFirstErrorMessage(error) });
  }

  redirect(targetPath);
}
