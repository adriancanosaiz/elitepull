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
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function getFirstErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Revisa los campos del formulario.";
  }

  if (error instanceof Error) {
    return error.message;
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

function parseAdminProductFormData(formData: FormData) {
  return adminProductSchema.parse({
    id: formData.get("id"),
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
  revalidatePath(`/producto/${result.slug}`);

  if (result.brandSlug === "accesorios") {
    revalidatePath("/accesorios");

    if (result.categorySlug) {
      revalidatePath(`/accesorios/${result.categorySlug}`);
    }

    return;
  }

  revalidatePath(`/marca/${result.brandSlug}`);

  if (result.categorySlug) {
    revalidatePath(`/marca/${result.brandSlug}/${result.categorySlug}`);
  }
}

export async function createAdminProductAction(formData: FormData) {
  try {
    const input = parseAdminProductFormData(formData);
    const result = await createAdminProduct(input);

    revalidateAdminProductPaths(result);
    redirect(buildRedirectUrl(`/admin/productos/${result.id}`, { success: "created" }));
  } catch (error) {
    redirect(
      buildRedirectUrl("/admin/productos/nuevo", {
        error: getFirstErrorMessage(error),
      }),
    );
  }
}

export async function updateAdminProductAction(formData: FormData) {
  const fallbackId =
    typeof formData.get("id") === "string" ? (formData.get("id") as string) : undefined;

  try {
    const input = parseAdminProductFormData(formData);
    const result = await updateAdminProduct(input);

    revalidateAdminProductPaths(result);
    redirect(buildRedirectUrl(`/admin/productos/${result.id}`, { success: "updated" }));
  } catch (error) {
    redirect(
      buildRedirectUrl(
        fallbackId ? `/admin/productos/${fallbackId}` : "/admin/productos",
        {
          error: getFirstErrorMessage(error),
        },
      ),
    );
  }
}

export async function toggleAdminProductActiveAction(formData: FormData) {
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

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: getFirstErrorMessage(error),
    };
  }
}

export async function updateAdminProductStockAction(formData: FormData) {
  try {
    const parsedPayload = updateStockSchema.parse({
      productId: formData.get("productId"),
      stock: formData.get("stock"),
    });

    const result = await updateAdminProductStock(parsedPayload.productId, parsedPayload.stock);

    revalidateAdminProductPaths(result);

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: getFirstErrorMessage(error),
    };
  }
}
