import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireAdminAccess } from "@/lib/auth/admin";
import type { Database } from "@/lib/supabase/database.types";
import type { ExpansionReleaseStatus, ProductLanguage } from "@/types/store";

type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

type BrandRow = Database["public"]["Tables"]["brands"]["Row"];
type ExpansionRow = Database["public"]["Tables"]["expansions"]["Row"];
type FormatRow = Database["public"]["Tables"]["product_formats"]["Row"];
type LanguageRow = Database["public"]["Tables"]["product_languages"]["Row"];
type AvailabilityRow = Database["public"]["Tables"]["expansion_format_availability"]["Row"];

const adminCatalogEnvSchema = z.object({
  supabaseUrl: z.string().trim().url("Falta una SUPABASE URL valida."),
  serviceRoleKey: z.string().trim().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY."),
});

export type AdminCatalogBrand = {
  id: string;
  slug: string;
  label: string;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogExpansion = {
  id: string;
  brandId: string;
  brandSlug: string;
  brandLabel: string;
  slug: string;
  label: string;
  releaseStatus: ExpansionReleaseStatus;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogFormat = {
  id: string;
  slug: string;
  label: string;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogLanguage = {
  code: ProductLanguage;
  label: string;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogAvailability = {
  id: string;
  expansionId: string;
  expansionLabel: string;
  brandId: string;
  brandSlug: string;
  brandLabel: string;
  formatId: string;
  formatSlug: string;
  formatLabel: string;
  languageCode: ProductLanguage;
  variantLabel?: string;
  active: boolean;
  isPreorderDefault: boolean;
  sortOrder: number;
};

export type AdminProductCatalogOptions = {
  brands: AdminCatalogBrand[];
  expansions: AdminCatalogExpansion[];
  formats: AdminCatalogFormat[];
  languages: AdminCatalogLanguage[];
  availabilities: AdminCatalogAvailability[];
};

export type AdminCatalogBrandInput = {
  id?: string;
  slug: string;
  label: string;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogExpansionInput = {
  id?: string;
  brandId: string;
  slug: string;
  label: string;
  releaseStatus: ExpansionReleaseStatus;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogFormatInput = {
  id?: string;
  slug: string;
  label: string;
  active: boolean;
  sortOrder: number;
};

export type AdminCatalogAvailabilityInput = {
  id?: string;
  expansionId: string;
  formatId: string;
  languageCode: ProductLanguage;
  variantLabel?: string;
  active: boolean;
  isPreorderDefault: boolean;
  sortOrder: number;
};

export type AdminCatalogAvailabilityBatchInput = {
  expansionId: string;
  selections: Array<{
    formatId: string;
    languageCodes: ProductLanguage[];
  }>;
  variantLabel?: string;
  active: boolean;
  isPreorderDefault: boolean;
  sortOrder: number;
};

type ExpansionQueryRow = ExpansionRow & {
  brand: Pick<BrandRow, "id" | "slug" | "label"> | null;
};

type AvailabilityQueryRow = AvailabilityRow & {
  expansion: (Pick<ExpansionRow, "id" | "label" | "brand_id"> & {
    brand: Pick<BrandRow, "id" | "slug" | "label"> | null;
  }) | null;
  format: Pick<FormatRow, "id" | "slug" | "label"> | null;
};

function getAdminCatalogEnv() {
  return adminCatalogEnvSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function createAdminCatalogServiceClient() {
  const env = getAdminCatalogEnv();

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

function normalizeOptionalString(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function getCatalogErrorMessage(error: unknown, fallbackMessage: string) {
  if (!error || typeof error !== "object") {
    return fallbackMessage;
  }

  const supabaseError = error as SupabaseLikeError;
  const fullMessage = [
    supabaseError.message,
    supabaseError.details,
    supabaseError.hint,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (supabaseError.code === "23505") {
    if (fullMessage.includes("brands_slug_key")) {
      return "Ya existe otra marca con ese slug.";
    }

    if (fullMessage.includes("expansions_brand_id_slug_key")) {
      return "Ya existe otra expansion con ese slug dentro de esa marca.";
    }

    if (fullMessage.includes("product_formats_slug_key")) {
      return "Ya existe otro formato con ese slug.";
    }

    if (fullMessage.includes("idx_expansion_format_availability_unique")) {
      return "Esa combinacion de expansion, formato, idioma y variante ya existe.";
    }
  }

  if (supabaseError.code === "23503") {
    return "Alguna referencia maestra ya no existe o no esta disponible.";
  }

  return fallbackMessage;
}

function mapBrandRow(row: BrandRow): AdminCatalogBrand {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

function mapExpansionRow(row: ExpansionQueryRow): AdminCatalogExpansion {
  return {
    id: row.id,
    brandId: row.brand_id,
    brandSlug: row.brand?.slug ?? "",
    brandLabel: row.brand?.label ?? "Marca",
    slug: row.slug,
    label: row.label,
    releaseStatus: row.release_status as ExpansionReleaseStatus,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

function mapFormatRow(row: FormatRow): AdminCatalogFormat {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

function mapLanguageRow(row: LanguageRow): AdminCatalogLanguage {
  return {
    code: row.code as ProductLanguage,
    label: row.label,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

function mapAvailabilityRow(row: AvailabilityQueryRow): AdminCatalogAvailability {
  return {
    id: row.id,
    expansionId: row.expansion_id,
    expansionLabel: row.expansion?.label ?? "Expansion",
    brandId: row.expansion?.brand?.id ?? row.expansion?.brand_id ?? "",
    brandSlug: row.expansion?.brand?.slug ?? "",
    brandLabel: row.expansion?.brand?.label ?? "Marca",
    formatId: row.format_id,
    formatSlug: row.format?.slug ?? "",
    formatLabel: row.format?.label ?? "Formato",
    languageCode: row.language_code as ProductLanguage,
    variantLabel: normalizeOptionalString(row.variant_label),
    active: row.active,
    isPreorderDefault: row.is_preorder_default,
    sortOrder: row.sort_order,
  };
}

async function fetchAdminCatalogBrandsInternal(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("brands")
    .select("id, slug, label, active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    throw new Error(`[admin-catalog] No se pudieron cargar las marcas: ${error.message}`);
  }

  return ((data ?? []) as BrandRow[]).map(mapBrandRow);
}

async function fetchAdminCatalogExpansionsInternal(client: SupabaseClient<Database>) {
  const expansionsTable = client.from("expansions") as any;
  const { data, error } = await expansionsTable
    .select(`
      id,
      brand_id,
      slug,
      label,
      release_status,
      active,
      sort_order,
      created_at,
      updated_at,
      brand:brands!expansions_brand_id_fkey (
        id,
        slug,
        label
      )
    `)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    throw new Error(`[admin-catalog] No se pudieron cargar las expansiones: ${error.message}`);
  }

  return ((data ?? []) as ExpansionQueryRow[]).map(mapExpansionRow);
}

async function fetchAdminCatalogFormatsInternal(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("product_formats")
    .select("id, slug, label, active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    throw new Error(`[admin-catalog] No se pudieron cargar los formatos: ${error.message}`);
  }

  return ((data ?? []) as FormatRow[]).map(mapFormatRow);
}

async function fetchAdminCatalogLanguagesInternal(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("product_languages")
    .select("code, label, active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`[admin-catalog] No se pudieron cargar los idiomas: ${error.message}`);
  }

  return ((data ?? []) as LanguageRow[]).map(mapLanguageRow);
}

async function fetchAdminCatalogAvailabilityInternal(client: SupabaseClient<Database>) {
  const availabilityTable = client.from("expansion_format_availability") as any;
  const { data, error } = await availabilityTable
    .select(`
      id,
      expansion_id,
      format_id,
      language_code,
      variant_label,
      active,
      is_preorder_default,
      sort_order,
      created_at,
      updated_at,
      expansion:expansions!expansion_format_availability_expansion_id_fkey (
        id,
        label,
        brand_id,
        brand:brands!expansions_brand_id_fkey (
          id,
          slug,
          label
        )
      ),
      format:product_formats!expansion_format_availability_format_id_fkey (
        id,
        slug,
        label
      )
    `)
    .order("sort_order", { ascending: true })
    .order("language_code", { ascending: true });

  if (error) {
    throw new Error(
      `[admin-catalog] No se pudieron cargar las combinaciones de catalogo: ${error.message}`,
    );
  }

  return ((data ?? []) as AvailabilityQueryRow[]).map(mapAvailabilityRow);
}

export async function getAdminProductCatalogOptions(): Promise<AdminProductCatalogOptions> {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const [brands, expansions, formats, languages, availabilities] = await Promise.all([
    fetchAdminCatalogBrandsInternal(client),
    fetchAdminCatalogExpansionsInternal(client),
    fetchAdminCatalogFormatsInternal(client),
    fetchAdminCatalogLanguagesInternal(client),
    fetchAdminCatalogAvailabilityInternal(client),
  ]);

  return {
    brands,
    expansions,
    formats,
    languages,
    availabilities,
  };
}

export async function getAdminCatalogBrands() {
  await requireAdminAccess();
  return fetchAdminCatalogBrandsInternal(createAdminCatalogServiceClient());
}

export async function getAdminCatalogExpansions() {
  await requireAdminAccess();
  return fetchAdminCatalogExpansionsInternal(createAdminCatalogServiceClient());
}

export async function getAdminCatalogFormats() {
  await requireAdminAccess();
  return fetchAdminCatalogFormatsInternal(createAdminCatalogServiceClient());
}

export async function getAdminCatalogLanguages() {
  await requireAdminAccess();
  return fetchAdminCatalogLanguagesInternal(createAdminCatalogServiceClient());
}

export async function getAdminCatalogAvailability() {
  await requireAdminAccess();
  return fetchAdminCatalogAvailabilityInternal(createAdminCatalogServiceClient());
}

export async function saveAdminCatalogBrand(input: AdminCatalogBrandInput) {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const payload: Database["public"]["Tables"]["brands"]["Insert"] = {
    id: input.id,
    slug: input.slug,
    label: input.label,
    active: input.active,
    sort_order: input.sortOrder,
  };
  const brandsTable = client.from("brands") as any;
  const query = input.id
    ? brandsTable.update(payload).eq("id", input.id)
    : brandsTable.insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(getCatalogErrorMessage(error, "No se pudo guardar la marca."));
  }
}

export async function saveAdminCatalogExpansion(input: AdminCatalogExpansionInput) {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const payload: Database["public"]["Tables"]["expansions"]["Insert"] = {
    id: input.id,
    brand_id: input.brandId,
    slug: input.slug,
    label: input.label,
    release_status: input.releaseStatus,
    active: input.active,
    sort_order: input.sortOrder,
  };
  const expansionsTable = client.from("expansions") as any;
  const query = input.id
    ? expansionsTable.update(payload).eq("id", input.id)
    : expansionsTable.insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(getCatalogErrorMessage(error, "No se pudo guardar la expansion."));
  }
}

export async function saveAdminCatalogFormat(input: AdminCatalogFormatInput) {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const payload: Database["public"]["Tables"]["product_formats"]["Insert"] = {
    id: input.id,
    slug: input.slug,
    label: input.label,
    active: input.active,
    sort_order: input.sortOrder,
  };
  const formatsTable = client.from("product_formats") as any;
  const query = input.id
    ? formatsTable.update(payload).eq("id", input.id)
    : formatsTable.insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(getCatalogErrorMessage(error, "No se pudo guardar el formato."));
  }
}

export async function saveAdminCatalogAvailability(input: AdminCatalogAvailabilityInput) {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const payload: Database["public"]["Tables"]["expansion_format_availability"]["Insert"] = {
    id: input.id,
    expansion_id: input.expansionId,
    format_id: input.formatId,
    language_code: input.languageCode,
    variant_label: normalizeOptionalString(input.variantLabel) ?? null,
    active: input.active,
    is_preorder_default: input.isPreorderDefault,
    sort_order: input.sortOrder,
  };
  const availabilityTable = client.from("expansion_format_availability") as any;
  const query = input.id
    ? availabilityTable.update(payload).eq("id", input.id)
    : availabilityTable.insert(payload);
  const { error } = await query;

  if (error) {
    throw new Error(
      getCatalogErrorMessage(error, "No se pudo guardar la configuracion de catalogo."),
    );
  }
}

export async function saveAdminCatalogAvailabilityBatch(
  input: AdminCatalogAvailabilityBatchInput,
) {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const availabilityTable = client.from("expansion_format_availability") as any;
  const normalizedVariantLabel = normalizeOptionalString(input.variantLabel) ?? null;
  let createdCount = 0;
  let skippedCount = 0;
  let nextSortOrder = input.sortOrder;

  for (const selection of input.selections) {
    for (const languageCode of selection.languageCodes) {
      const payload: Database["public"]["Tables"]["expansion_format_availability"]["Insert"] = {
        expansion_id: input.expansionId,
        format_id: selection.formatId,
        language_code: languageCode,
        variant_label: normalizedVariantLabel,
        active: input.active,
        is_preorder_default: input.isPreorderDefault,
        sort_order: nextSortOrder,
      };

      const { error } = await availabilityTable.insert(payload);

      if (!error) {
        createdCount += 1;
        nextSortOrder += 10;
        continue;
      }

      const duplicateMessage = getCatalogErrorMessage(error, "");

      if (duplicateMessage === "Esa combinacion de expansion, formato, idioma y variante ya existe.") {
        skippedCount += 1;
        continue;
      }

      throw new Error(
        getCatalogErrorMessage(error, "No se pudo guardar la configuracion de catalogo."),
      );
    }
  }

  return {
    createdCount,
    skippedCount,
  };
}

export async function deleteAdminCatalogAvailability(id: string) {
  await requireAdminAccess();

  const client = createAdminCatalogServiceClient();
  const { error } = await client.from("expansion_format_availability").delete().eq("id", id);

  if (error) {
    throw new Error(
      getCatalogErrorMessage(error, "No se pudo eliminar la configuracion de catalogo."),
    );
  }
}
