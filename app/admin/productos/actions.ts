"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createAdminProduct,
  toggleAdminProductActive,
  updateAdminProduct,
  updateAdminProductStock,
  type AdminProductMutationResult,
} from "@/lib/admin/products";
import { adminProductSchema } from "@/lib/validators/admin-product";

const toggleActiveSchema = z.object({
  id: z.string().uuid("El id de producto no es valido."),
  nextActive: z.preprocess(
    (value) => value === true || value === "true" || value === "on",
    z.boolean(),
  ),
});

const updateStockSchema = z.object({
  productId: z.string().uuid("El id de producto no es valido."),
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
    return error.issues[0]?.message ?? "Revisa los campos del formulario.";
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

function parseAdminProductFormData(formData: FormData, forcedId?: string) {
  return adminProductSchema.parse({
    id: forcedId ?? formData.get("id"),
    slug: formData.get("slug"),
    sku: formData.get("sku"),
    name: formData.get("name"),
    description: formData.get("description"),
    productType: formData.get("productType"),
    brandSlug: formData.get("brandSlug"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    featured: formData.get("featured"),
    isPreorder: formData.get("isPreorder"),
    active: formData.get("active"),
    stock: formData.get("stock"),
    tags: getFormFieldValue(formData, "tags"),
    attributes: {
      expansion: formData.get("expansion"),
      language: formData.get("language"),
      rarity: formData.get("rarity"),
      condition: formData.get("condition"),
      badge: formData.get("badge"),
    },
    coverImagePath: formData.get("coverImagePath"),
    galleryImagePaths: getFormFieldValue(formData, "galleryImagePaths"),
  });
}

function revalidateAdminProductPaths(result: AdminProductMutationResult) {
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
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

export async function createAdminProductAction(formData: FormData) {
  let targetPath = "/admin/productos/nuevo";

  try {
    const input = parseAdminProductFormData(formData);
    const result = await createAdminProduct(input);

    revalidateAdminProductPaths(result);
    targetPath = buildRedirectUrl(`/admin/productos/${result.id}`, { success: "created" });
  } catch (error) {
    targetPath = buildRedirectUrl("/admin/productos/nuevo", {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function updateAdminProductAction(productId: string, formData: FormData) {
  const fallbackId = productId;
  let targetPath = `/admin/productos/${fallbackId}`;

  try {
    const input = parseAdminProductFormData(formData, productId);
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
      id: formData.get("id"),
      nextActive: formData.get("nextActive"),
    });

    const result = await toggleAdminProductActive(
      parsedPayload.id,
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
