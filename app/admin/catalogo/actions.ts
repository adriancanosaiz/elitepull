"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  saveAdminCatalogAvailability,
  saveAdminCatalogAvailabilityBatch,
  saveAdminCatalogBrand,
  saveAdminCatalogExpansion,
  saveAdminCatalogFormat,
} from "@/lib/admin/catalog-taxonomy";
import { buildCatalogSlugFromLabel } from "@/lib/admin/catalog-identifiers";
import { createUuidLikeSchema } from "@/lib/validators/uuid-like";

const optionalUuidLikeSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return undefined;
    }

    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : undefined;
  },
  createUuidLikeSchema("El id no es valido.").optional(),
);

const releaseStatusSchema = z.enum(["upcoming", "live", "archived"]);
const languageSchema = z.enum(["ES", "EN", "JP"]);

const brandPayloadSchema = z.object({
  id: optionalUuidLikeSchema,
  label: z.string().trim().min(1, "La etiqueta es obligatoria."),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  sortOrder: z.preprocess(
    (value) => Number(typeof value === "string" ? value.trim() : value),
    z.number().int("El orden debe ser un entero."),
  ),
});

const expansionPayloadSchema = z.object({
  id: optionalUuidLikeSchema,
  brandId: createUuidLikeSchema("La marca seleccionada no es valida."),
  label: z.string().trim().min(1, "La etiqueta es obligatoria."),
  releaseStatus: releaseStatusSchema,
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  sortOrder: z.preprocess(
    (value) => Number(typeof value === "string" ? value.trim() : value),
    z.number().int("El orden debe ser un entero."),
  ),
});

const formatPayloadSchema = z.object({
  id: optionalUuidLikeSchema,
  label: z.string().trim().min(1, "La etiqueta es obligatoria."),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  sortOrder: z.preprocess(
    (value) => Number(typeof value === "string" ? value.trim() : value),
    z.number().int("El orden debe ser un entero."),
  ),
});

const availabilityPayloadSchema = z.object({
  id: optionalUuidLikeSchema,
  expansionId: createUuidLikeSchema("La expansion seleccionada no es valida."),
  formatId: createUuidLikeSchema("El formato seleccionado no es valido."),
  languageCode: languageSchema,
  variantLabel: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : undefined;
    },
    z.string().min(1).optional(),
  ),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  isPreorderDefault: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  sortOrder: z.preprocess(
    (value) => Number(typeof value === "string" ? value.trim() : value),
    z.number().int("El orden debe ser un entero."),
  ),
});

const availabilityBatchBaseSchema = z.object({
  expansionId: createUuidLikeSchema("La expansion seleccionada no es valida."),
  variantLabel: z.preprocess(
    (value) => {
      if (typeof value !== "string") {
        return undefined;
      }

      const trimmedValue = value.trim();
      return trimmedValue.length > 0 ? trimmedValue : undefined;
    },
    z.string().min(1).optional(),
  ),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  isPreorderDefault: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  sortOrder: z.preprocess(
    (value) => Number(typeof value === "string" ? value.trim() : value),
    z.number().int("El orden debe ser un entero."),
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

function revalidateAdminCatalogPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  revalidatePath("/admin/catalogo/marcas");
  revalidatePath("/admin/catalogo/expansiones");
  revalidatePath("/admin/catalogo/formatos");
  revalidatePath("/admin/catalogo/configuracion");
  revalidatePath("/");
  revalidatePath("/catalogo");
  revalidatePath("/preventa");
  revalidatePath("/accesorios");
}

function parseAvailabilityBatchSelections(formData: FormData) {
  const selectedFormatIds = z
    .array(createUuidLikeSchema("Uno de los formatos seleccionados no es valido."))
    .min(1, "Selecciona al menos un formato.")
    .parse(formData.getAll("selectedFormatIds"));

  return selectedFormatIds.map((formatId) => {
    const languageCodes = z
      .array(languageSchema)
      .min(1, "Cada formato seleccionado debe tener al menos un idioma.")
      .parse(formData.getAll(`languages::${formatId}`));

    return {
      formatId,
      languageCodes,
    };
  });
}

export async function saveAdminCatalogBrandAction(formData: FormData) {
  let targetPath = "/admin/catalogo/marcas";

  try {
    const payload = brandPayloadSchema.parse({
      id: formData.get("id"),
      label: formData.get("label"),
      active: formData.get("active"),
      sortOrder: formData.get("sortOrder"),
    });

    await saveAdminCatalogBrand({
      ...payload,
      slug: buildCatalogSlugFromLabel(payload.label),
    });
    revalidateAdminCatalogPaths();
    targetPath = buildRedirectUrl("/admin/catalogo/marcas", { success: "saved" });
  } catch (error) {
    targetPath = buildRedirectUrl("/admin/catalogo/marcas", {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function saveAdminCatalogExpansionAction(formData: FormData) {
  let targetPath = "/admin/catalogo/expansiones";

  try {
    const payload = expansionPayloadSchema.parse({
      id: formData.get("id"),
      brandId: formData.get("brandId"),
      label: formData.get("label"),
      releaseStatus: formData.get("releaseStatus"),
      active: formData.get("active"),
      sortOrder: formData.get("sortOrder"),
    });

    await saveAdminCatalogExpansion({
      ...payload,
      slug: buildCatalogSlugFromLabel(payload.label),
    });
    revalidateAdminCatalogPaths();
    targetPath = buildRedirectUrl("/admin/catalogo/expansiones", { success: "saved" });
  } catch (error) {
    targetPath = buildRedirectUrl("/admin/catalogo/expansiones", {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function saveAdminCatalogFormatAction(formData: FormData) {
  let targetPath = "/admin/catalogo/formatos";

  try {
    const payload = formatPayloadSchema.parse({
      id: formData.get("id"),
      label: formData.get("label"),
      active: formData.get("active"),
      sortOrder: formData.get("sortOrder"),
    });

    await saveAdminCatalogFormat({
      ...payload,
      slug: buildCatalogSlugFromLabel(payload.label),
    });
    revalidateAdminCatalogPaths();
    targetPath = buildRedirectUrl("/admin/catalogo/formatos", { success: "saved" });
  } catch (error) {
    targetPath = buildRedirectUrl("/admin/catalogo/formatos", {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function saveAdminCatalogAvailabilityAction(formData: FormData) {
  let targetPath = "/admin/catalogo/configuracion";

  try {
    const payload = availabilityPayloadSchema.parse({
      id: formData.get("id"),
      expansionId: formData.get("expansionId"),
      formatId: formData.get("formatId"),
      languageCode: formData.get("languageCode"),
      variantLabel: formData.get("variantLabel"),
      active: formData.get("active"),
      isPreorderDefault: formData.get("isPreorderDefault"),
      sortOrder: formData.get("sortOrder"),
    });

    await saveAdminCatalogAvailability(payload);
    revalidateAdminCatalogPaths();
    targetPath = buildRedirectUrl("/admin/catalogo/configuracion", { success: "saved" });
  } catch (error) {
    targetPath = buildRedirectUrl("/admin/catalogo/configuracion", {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}

export async function saveAdminCatalogAvailabilityBatchAction(formData: FormData) {
  let targetPath = "/admin/catalogo/configuracion";

  try {
    const basePayload = availabilityBatchBaseSchema.parse({
      expansionId: formData.get("expansionId"),
      variantLabel: formData.get("variantLabel"),
      active: formData.get("active"),
      isPreorderDefault: formData.get("isPreorderDefault"),
      sortOrder: formData.get("sortOrder"),
    });
    const selections = parseAvailabilityBatchSelections(formData);
    const result = await saveAdminCatalogAvailabilityBatch({
      ...basePayload,
      selections,
    });

    if (result.createdCount === 0) {
      throw new Error("Todas las combinaciones seleccionadas ya existen.");
    }

    revalidateAdminCatalogPaths();
    targetPath = buildRedirectUrl("/admin/catalogo/configuracion", { success: "saved" });
  } catch (error) {
    targetPath = buildRedirectUrl("/admin/catalogo/configuracion", {
      error: getFirstErrorMessage(error),
    });
  }

  redirect(targetPath);
}
