import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  PRODUCT_MEDIA_BUCKET,
  normalizeProductMediaPath,
} from "@/lib/supabase/storage";
import { requireAdminAccess } from "@/lib/auth/admin";
import {
  buildGeneratedProductSku,
  buildGeneratedProductSlug,
} from "@/lib/admin/catalog-identifiers";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  AdminProductAttributesInput,
  AdminProductInput,
} from "@/lib/validators/admin-product";
import type { ProductLanguage, ProductType } from "@/types/store";

type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "slug" | "label" | "description" | "brand_slug" | "sort_order" | "active"
>;

type BrandRow = Pick<
  Database["public"]["Tables"]["brands"]["Row"],
  "id" | "slug" | "label" | "active"
>;

type ExpansionRow = Pick<
  Database["public"]["Tables"]["expansions"]["Row"],
  "id" | "brand_id" | "slug" | "label" | "release_status" | "active"
>;

type FormatRow = Pick<
  Database["public"]["Tables"]["product_formats"]["Row"],
  "id" | "slug" | "label" | "active"
>;

type LanguageRow = Pick<
  Database["public"]["Tables"]["product_languages"]["Row"],
  "code" | "label" | "active"
>;

type AvailabilityRow = Pick<
  Database["public"]["Tables"]["expansion_format_availability"]["Row"],
  "id" | "expansion_id" | "format_id" | "language_code" | "variant_label" | "active" | "is_preorder_default"
>;

type InventoryRow = Pick<
  Database["public"]["Tables"]["inventory"]["Row"],
  "available_quantity"
>;

type ProductImageRow = Pick<
  Database["public"]["Tables"]["product_images"]["Row"],
  "storage_path" | "sort_order"
>;

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type SupabaseLikeError = {
  code?: string;
  message?: string;
  details?: string | null;
  hint?: string | null;
};

type AdminProductRecord = ProductRow & {
  brand: BrandRow | null;
  expansion: ExpansionRow | null;
  format: FormatRow | null;
  category: CategoryRow | null;
  inventory: InventoryRow | InventoryRow[] | null;
  images: ProductImageRow[] | null;
};

const adminProductsEnvSchema = z.object({
  supabaseUrl: z.string().trim().url("Falta una SUPABASE URL valida."),
  serviceRoleKey: z.string().trim().min(1, "Falta SUPABASE_SERVICE_ROLE_KEY."),
});

export type AdminCategoryOption = {
  id: string;
  brandId: string;
  brandSlug: string;
  slug: string;
  label: string;
  description: string | null;
  sortOrder: number;
};

export type AdminProductListItem = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  brandId: string;
  brandSlug: string;
  brandLabel: string;
  categoryId: string;
  categoryLabel: string;
  categorySlug: string;
  expansionId: string;
  expansionLabel: string;
  expansionSlug: string;
  formatId: string;
  formatLabel: string;
  formatSlug: string;
  languageCode: ProductLanguage;
  variantLabel?: string;
  productType: ProductType;
  price: number;
  compareAtPrice?: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isPreorder: boolean;
  coverImagePath?: string;
  updatedAt: string;
};

export type AdminProductDetail = Omit<
  AdminProductInput,
  "id" | "slug" | "sku" | "galleryImagePaths"
> & {
  id: string;
  slug: string;
  sku: string;
  brandSlug: string;
  brandLabel: string;
  categoryLabel: string;
  categorySlug: string;
  expansionLabel: string;
  expansionSlug: string;
  formatLabel: string;
  formatSlug: string;
  galleryImagePaths: string[];
  createdAt: string;
  updatedAt: string;
};

export type AdminProductMutationResult = {
  id: string;
  slug: string;
  brandSlug: string;
  categorySlug: string;
  isPreorder: boolean;
};

const ADMIN_PRODUCT_SELECT = `
  id,
  slug,
  sku,
  name,
  description,
  product_type,
  brand_slug,
  brand_id,
  category_id,
  expansion_id,
  format_id,
  language_code,
  variant_label,
  price,
  compare_at_price,
  featured,
  is_preorder,
  active,
  main_image_path,
  attributes,
  tags,
  created_at,
  updated_at,
  brand:brands!products_brand_id_fkey (
    id,
    slug,
    label,
    active
  ),
  expansion:expansions!products_expansion_id_fkey (
    id,
    brand_id,
    slug,
    label,
    release_status,
    active
  ),
  format:product_formats!products_format_id_fkey (
    id,
    slug,
    label,
    active
  ),
  category:categories!products_category_id_fkey (
    id,
    slug,
    label,
    description,
    brand_slug,
    sort_order,
    active
  ),
  inventory:inventory (
    available_quantity
  ),
  images:product_images (
    storage_path,
    sort_order
  )
`;

function getAdminProductsEnv() {
  return adminProductsEnvSchema.parse({
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}

function createAdminProductsServiceClient() {
  const env = getAdminProductsEnv();

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

function sanitizeAdminProductSearch(search?: string) {
  return search
    ?.trim()
    .replace(/[%]/g, "")
    .replace(/,/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOptionalString(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseMoney(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim()) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  return 0;
}

function parseOptionalMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const parsedValue = parseMoney(value);
  return parsedValue > 0 ? parsedValue : undefined;
}

function getAdminProductErrorMessage(error: unknown, fallbackMessage: string) {
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
    if (fullMessage.includes("products_slug_key") || fullMessage.includes("(slug)")) {
      return "Ya existe otro producto con ese slug.";
    }

    if (fullMessage.includes("products_sku_key") || fullMessage.includes("(sku)")) {
      return "Ya existe otro producto con ese SKU.";
    }

    if (
      fullMessage.includes("product_images_product_id_storage_path_key") ||
      (fullMessage.includes("product_images") && fullMessage.includes("storage_path"))
    ) {
      return "La galeria contiene rutas repetidas. Revisa los paths antes de guardar.";
    }

    if (fullMessage.includes("product_images_product_id_sort_order_key")) {
      return "La galeria no se ha podido guardar por un conflicto de orden.";
    }
  }

  if (supabaseError.code === "23503") {
    if (fullMessage.includes("category")) {
      return "La categoria seleccionada no existe o no esta disponible para esa marca.";
    }

    if (fullMessage.includes("brand")) {
      return "La marca seleccionada ya no existe o no esta activa.";
    }

    if (fullMessage.includes("expansion")) {
      return "La expansion seleccionada ya no existe o no esta activa.";
    }

    if (fullMessage.includes("format")) {
      return "El formato seleccionado ya no existe o no esta activo.";
    }

    if (fullMessage.includes("language")) {
      return "El idioma seleccionado no es valido.";
    }
  }

  if (supabaseError.code === "22P02" && fullMessage.includes("uuid")) {
    return "El identificador del producto o de la configuracion seleccionada no es valido.";
  }

  if (fullMessage.includes("available_quantity")) {
    return "El stock indicado no es valido.";
  }

  return fallbackMessage;
}

function getInventoryValue(inventory: AdminProductRecord["inventory"]) {
  if (Array.isArray(inventory)) {
    return Math.max(inventory[0]?.available_quantity ?? 0, 0);
  }

  return Math.max(inventory?.available_quantity ?? 0, 0);
}

function parseAdminAttributes(value: Json): AdminProductAttributesInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const attributes = value as Record<string, unknown>;

  return {
    rarity: typeof attributes.rarity === "string" ? attributes.rarity : undefined,
    condition:
      attributes.condition === "NM" ||
      attributes.condition === "EX" ||
      attributes.condition === "LP" ||
      attributes.condition === "GD"
        ? attributes.condition
        : undefined,
    badge: typeof attributes.badge === "string" ? attributes.badge : undefined,
  };
}

function mapAdminProductListItem(record: AdminProductRecord): AdminProductListItem {
  return {
    id: record.id,
    slug: record.slug,
    sku: record.sku,
    name: record.name,
    brandId: record.brand_id,
    brandSlug: record.brand?.slug ?? record.brand_slug,
    brandLabel: record.brand?.label ?? record.brand_slug,
    categoryId: record.category_id,
    categoryLabel: record.category?.label ?? "Sin categoria",
    categorySlug: record.category?.slug ?? "",
    expansionId: record.expansion_id,
    expansionLabel: record.expansion?.label ?? "General",
    expansionSlug: record.expansion?.slug ?? "general",
    formatId: record.format_id,
    formatLabel: record.format?.label ?? "General",
    formatSlug: record.format?.slug ?? "general",
    languageCode: record.language_code as ProductLanguage,
    variantLabel: normalizeOptionalString(record.variant_label),
    productType: record.product_type as ProductType,
    price: parseMoney(record.price),
    compareAtPrice: parseOptionalMoney(record.compare_at_price),
    stock: getInventoryValue(record.inventory),
    active: record.active,
    featured: record.featured,
    isPreorder: record.is_preorder,
    coverImagePath: normalizeProductMediaPath(record.main_image_path) || undefined,
    updatedAt: record.updated_at,
  };
}

function mapAdminProductDetail(record: AdminProductRecord): AdminProductDetail {
  const galleryImagePaths = (record.images ?? [])
    .slice()
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((image) => normalizeProductMediaPath(image.storage_path))
    .filter((path): path is string => Boolean(path));

  return {
    id: record.id,
    slug: record.slug,
    sku: record.sku,
    name: record.name,
    description: record.description,
    productType: record.product_type as ProductType,
    brandId: record.brand_id,
    brandSlug: record.brand?.slug ?? record.brand_slug,
    brandLabel: record.brand?.label ?? record.brand_slug,
    categoryId: record.category_id,
    categoryLabel: record.category?.label ?? "Sin categoria",
    categorySlug: record.category?.slug ?? "",
    expansionId: record.expansion_id,
    expansionLabel: record.expansion?.label ?? "General",
    expansionSlug: record.expansion?.slug ?? "general",
    formatId: record.format_id,
    formatLabel: record.format?.label ?? "General",
    formatSlug: record.format?.slug ?? "general",
    languageCode: record.language_code as ProductLanguage,
    variantLabel: normalizeOptionalString(record.variant_label),
    price: parseMoney(record.price),
    compareAtPrice: parseOptionalMoney(record.compare_at_price),
    featured: record.featured,
    isPreorder: record.is_preorder,
    active: record.active,
    stock: getInventoryValue(record.inventory),
    tags: Array.isArray(record.tags) ? record.tags : [],
    attributes: parseAdminAttributes(record.attributes),
    coverImagePath: normalizeProductMediaPath(record.main_image_path) || undefined,
    galleryImagePaths,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

async function getValidatedBrand(
  client: SupabaseClient<Database>,
  brandId: string,
) {
  const { data, error } = await client
    .from("brands")
    .select("id, slug, label, active")
    .eq("id", brandId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo validar la marca: ${error.message}`);
  }

  if (!data) {
    throw new Error("La marca seleccionada no existe o no esta activa.");
  }

  return data as BrandRow;
}

async function getValidatedAdminCategory(
  client: SupabaseClient<Database>,
  categoryId: string,
  brandSlug: string,
) {
  const { data, error } = await client
    .from("categories")
    .select("id, slug, label, description, brand_slug, sort_order, active")
    .eq("id", categoryId)
    .eq("brand_slug", brandSlug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo validar la categoria: ${error.message}`);
  }

  if (!data) {
    throw new Error("La categoria seleccionada no existe o no esta activa para esa marca.");
  }

  return data as CategoryRow;
}

async function getValidatedExpansion(
  client: SupabaseClient<Database>,
  expansionId: string,
  brandId: string,
) {
  const { data, error } = await client
    .from("expansions")
    .select("id, brand_id, slug, label, release_status, active")
    .eq("id", expansionId)
    .eq("brand_id", brandId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo validar la expansion: ${error.message}`);
  }

  if (!data) {
    throw new Error("La expansion seleccionada no existe o no esta activa para esa marca.");
  }

  return data as ExpansionRow;
}

async function getValidatedFormat(
  client: SupabaseClient<Database>,
  formatId: string,
) {
  const { data, error } = await client
    .from("product_formats")
    .select("id, slug, label, active")
    .eq("id", formatId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo validar el formato: ${error.message}`);
  }

  if (!data) {
    throw new Error("El formato seleccionado no existe o no esta activo.");
  }

  return data as FormatRow;
}

async function getValidatedLanguage(
  client: SupabaseClient<Database>,
  languageCode: ProductLanguage,
) {
  const { data, error } = await client
    .from("product_languages")
    .select("code, label, active")
    .eq("code", languageCode)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo validar el idioma: ${error.message}`);
  }

  if (!data) {
    throw new Error("El idioma seleccionado no existe o no esta activo.");
  }

  return data as LanguageRow;
}

async function ensureActiveAvailability(
  client: SupabaseClient<Database>,
  input: {
    expansionId: string;
    formatId: string;
    languageCode: ProductLanguage;
    variantLabel?: string;
  },
) {
  const availabilityTable = client.from("expansion_format_availability") as any;
  let query = availabilityTable
    .select("id, expansion_id, format_id, language_code, variant_label, active, is_preorder_default")
    .eq("expansion_id", input.expansionId)
    .eq("format_id", input.formatId)
    .eq("language_code", input.languageCode)
    .eq("active", true);

  if (input.variantLabel) {
    query = query.eq("variant_label", input.variantLabel);
  } else {
    query = query.is("variant_label", null);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(
      `[admin-products] No se pudo validar la combinacion expansion + formato + idioma: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(
      "La combinacion seleccionada no existe en la configuracion del catalogo. Crea primero esa disponibilidad en admin.",
    );
  }

  return data as AvailabilityRow;
}

async function ensureAdminProductExists(
  client: SupabaseClient<Database>,
  productId: string,
) {
  const productsTable = client.from("products") as any;
  const { data, error } = await productsTable.select("id").eq("id", productId).maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo validar el producto: ${error.message}`);
  }

  if (!data) {
    throw new Error("El producto no existe o ya no esta disponible para editar.");
  }
}

async function syncAdminProductInventory(
  client: SupabaseClient<Database>,
  productId: string,
  stock: number,
) {
  const inventoryTable = client.from("inventory") as any;
  const { error } = await inventoryTable.upsert(
    {
      product_id: productId,
      available_quantity: stock,
    },
    {
      onConflict: "product_id",
    },
  );

  if (error) {
    throw new Error(
      getAdminProductErrorMessage(error, "No se pudo actualizar el stock del producto."),
    );
  }
}

async function replaceAdminProductGallery(
  client: SupabaseClient<Database>,
  productId: string,
  galleryImagePaths: string[],
) {
  const productImagesTable = client.from("product_images") as any;
  const normalizedPaths = galleryImagePaths
    .map((path) => normalizeProductMediaPath(path))
    .filter((path): path is string => Boolean(path));

  const { error: deleteError } = await productImagesTable.delete().eq("product_id", productId);

  if (deleteError) {
    throw new Error(
      getAdminProductErrorMessage(
        deleteError,
        "No se pudo actualizar la galeria del producto.",
      ),
    );
  }

  if (normalizedPaths.length === 0) {
    return;
  }

  const rows: Database["public"]["Tables"]["product_images"]["Insert"][] = normalizedPaths.map(
    (path, index) => ({
      product_id: productId,
      storage_path: path,
      sort_order: index + 1,
      is_primary: false,
      alt_text: null,
    }),
  );

  const { error: insertError } = await productImagesTable.insert(rows);

  if (insertError) {
    throw new Error(
      getAdminProductErrorMessage(
        insertError,
        "No se pudo guardar la galeria del producto.",
      ),
    );
  }
}

async function getAdminProductMutationMeta(
  client: SupabaseClient<Database>,
  productId: string,
): Promise<AdminProductMutationResult> {
  const productsTable = client.from("products") as any;
  const { data, error } = await productsTable
    .select(`
      id,
      slug,
      brand_slug,
      is_preorder,
      category:categories!products_category_id_fkey (
        slug
      )
    `)
    .eq("id", productId)
    .single();

  if (error) {
    throw new Error(
      `[admin-products] No se pudo resolver el producto actualizado: ${error.message}`,
    );
  }

  const row = data as {
    id: string;
    slug: string;
    brand_slug: string;
    is_preorder: boolean;
    category: { slug: string } | null;
  };

  return {
    id: row.id,
    slug: row.slug,
    brandSlug: row.brand_slug,
    categorySlug: row.category?.slug ?? "",
    isPreorder: row.is_preorder,
  };
}

async function getAdminProductDeletionMeta(
  client: SupabaseClient<Database>,
  productId: string,
): Promise<{
  mutation: AdminProductMutationResult;
  storagePaths: string[];
}> {
  const productsTable = client.from("products") as any;
  const { data, error } = await productsTable
    .select(`
      id,
      slug,
      brand_slug,
      is_preorder,
      main_image_path,
      category:categories!products_category_id_fkey (
        slug
      ),
      images:product_images (
        storage_path
      )
    `)
    .eq("id", productId)
    .single();

  if (error) {
    throw new Error(
      `[admin-products] No se pudo resolver el producto a eliminar: ${error.message}`,
    );
  }

  const row = data as {
    id: string;
    slug: string;
    brand_slug: string;
    is_preorder: boolean;
    main_image_path: string | null;
    category: { slug: string } | null;
    images: Array<{ storage_path: string | null }> | null;
  };

  const storagePaths = [
    normalizeProductMediaPath(row.main_image_path),
    ...(row.images ?? []).map((image) => normalizeProductMediaPath(image.storage_path)),
  ].filter((path): path is string => Boolean(path));

  return {
    mutation: {
      id: row.id,
      slug: row.slug,
      brandSlug: row.brand_slug,
      categorySlug: row.category?.slug ?? "",
      isPreorder: row.is_preorder,
    },
    storagePaths: [...new Set(storagePaths)],
  };
}

async function cleanupDeletedProductStorage(
  client: SupabaseClient<Database>,
  paths: string[],
) {
  const normalizedPaths = paths.filter(Boolean);

  if (normalizedPaths.length === 0) {
    return;
  }

  const { error } = await client.storage.from(PRODUCT_MEDIA_BUCKET).remove(normalizedPaths);

  if (error) {
    console.error(
      `[admin-products] No se pudieron limpiar los archivos del producto eliminado: ${error.message}`,
    );
  }
}

async function validateAdminProductSelections(
  client: SupabaseClient<Database>,
  input: AdminProductInput,
) {
  const brand = await getValidatedBrand(client, input.brandId);
  const category = await getValidatedAdminCategory(client, input.categoryId, brand.slug);
  const expansion = await getValidatedExpansion(client, input.expansionId, brand.id);
  const format = await getValidatedFormat(client, input.formatId);
  await getValidatedLanguage(client, input.languageCode);
  await ensureActiveAvailability(client, {
    expansionId: expansion.id,
    formatId: format.id,
    languageCode: input.languageCode,
    variantLabel: input.variantLabel,
  });

  return {
    brand,
    category,
    expansion,
    format,
  };
}

export async function getAdminProductsList(search?: string) {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  let query = client
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("updated_at", { ascending: false });

  const normalizedSearch = sanitizeAdminProductSearch(search);

  if (normalizedSearch) {
    query = query.or(
      `name.ilike.%${normalizedSearch}%,slug.ilike.%${normalizedSearch}%,sku.ilike.%${normalizedSearch}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`[admin-products] No se pudo cargar el listado: ${error.message}`);
  }

  return ((data ?? []) as AdminProductRecord[]).map(mapAdminProductListItem);
}

export async function getAdminProductById(id: string) {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  const { data, error } = await client
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`[admin-products] No se pudo cargar el producto: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapAdminProductDetail(data as AdminProductRecord);
}

export async function getAdminCategories() {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  const [brandRows, categoryRows] = await Promise.all([
    client
      .from("brands")
      .select("id, slug, label, active")
      .eq("active", true),
    (client.from("categories") as any)
      .select("id, brand_slug, slug, label, description, sort_order")
      .eq("active", true)
      .order("brand_slug", { ascending: true })
      .order("sort_order", { ascending: true }),
  ]);

  if (brandRows.error) {
    throw new Error(`[admin-products] No se pudieron cargar las marcas: ${brandRows.error.message}`);
  }

  if (categoryRows.error) {
    throw new Error(
      `[admin-products] No se pudieron cargar las categorias: ${categoryRows.error.message}`,
    );
  }

  const brandIdBySlug = new Map(
    ((brandRows.data ?? []) as BrandRow[]).map((brand) => [brand.slug, brand.id]),
  );

  const rows = (categoryRows.data ?? []) as Array<{
    id: string;
    brand_slug: string;
    slug: string;
    label: string;
    description: string | null;
    sort_order: number;
  }>;

  return rows
    .map((category) => ({
      id: category.id,
      brandId: brandIdBySlug.get(category.brand_slug) ?? "",
      brandSlug: category.brand_slug,
      slug: category.slug,
      label: category.label,
      description: category.description,
      sortOrder: category.sort_order,
    }))
    .filter((category) => category.brandId.length > 0) as AdminCategoryOption[];
}

export async function createAdminProduct(input: AdminProductInput) {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  const productId = input.id ?? crypto.randomUUID();
  const { brand, category, expansion, format } = await validateAdminProductSelections(client, input);
  const productsTable = client.from("products") as any;

  const productPayload: Database["public"]["Tables"]["products"]["Insert"] = {
    id: productId,
    slug: buildGeneratedProductSlug({
      brandSlug: brand.slug,
      expansionSlug: expansion.slug,
      formatSlug: format.slug,
      languageCode: input.languageCode,
      variantLabel: input.variantLabel,
      name: input.name,
    }),
    sku: buildGeneratedProductSku({
      brandSlug: brand.slug,
      expansionSlug: expansion.slug,
      formatSlug: format.slug,
      languageCode: input.languageCode,
      variantLabel: input.variantLabel,
      name: input.name,
    }),
    name: input.name,
    description: input.description,
    product_type: input.productType,
    brand_slug: brand.slug,
    brand_id: brand.id,
    category_id: category.id,
    expansion_id: expansion.id,
    format_id: format.id,
    language_code: input.languageCode,
    variant_label: input.variantLabel ?? null,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    featured: input.featured,
    is_preorder: input.isPreorder,
    active: input.active,
    main_image_path:
      input.coverImagePath !== undefined
        ? normalizeProductMediaPath(input.coverImagePath) || null
        : null,
    attributes: input.attributes,
    tags: input.tags,
  };

  const { error } = await productsTable.insert(productPayload);

  if (error) {
    throw new Error(getAdminProductErrorMessage(error, "No se pudo crear el producto."));
  }

  await syncAdminProductInventory(client, productId, input.stock);

  if (input.galleryImagePaths && input.galleryImagePaths.length > 0) {
    await replaceAdminProductGallery(client, productId, input.galleryImagePaths);
  }

  return {
    id: productId,
    slug: productPayload.slug,
    brandSlug: brand.slug,
    categorySlug: category.slug,
    isPreorder: input.isPreorder,
  } satisfies AdminProductMutationResult;
}

export async function updateAdminProduct(input: AdminProductInput) {
  await requireAdminAccess();

  if (!input.id) {
    throw new Error("No se puede actualizar un producto sin id.");
  }

  const client = createAdminProductsServiceClient();
  await ensureAdminProductExists(client, input.id);
  const { brand, category, expansion, format } = await validateAdminProductSelections(client, input);
  const productsTable = client.from("products") as any;
  const nextSlug = buildGeneratedProductSlug({
    brandSlug: brand.slug,
    expansionSlug: expansion.slug,
    formatSlug: format.slug,
    languageCode: input.languageCode,
    variantLabel: input.variantLabel,
    name: input.name,
  });
  const nextSku = buildGeneratedProductSku({
    brandSlug: brand.slug,
    expansionSlug: expansion.slug,
    formatSlug: format.slug,
    languageCode: input.languageCode,
    variantLabel: input.variantLabel,
    name: input.name,
  });

  const productPayload: Database["public"]["Tables"]["products"]["Update"] = {
    slug: nextSlug,
    sku: nextSku,
    name: input.name,
    description: input.description,
    product_type: input.productType,
    brand_slug: brand.slug,
    brand_id: brand.id,
    category_id: category.id,
    expansion_id: expansion.id,
    format_id: format.id,
    language_code: input.languageCode,
    variant_label: input.variantLabel ?? null,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    featured: input.featured,
    is_preorder: input.isPreorder,
    active: input.active,
    attributes: input.attributes,
    tags: input.tags,
  };

  if (input.coverImagePath !== undefined) {
    productPayload.main_image_path = normalizeProductMediaPath(input.coverImagePath) || null;
  }

  const { error } = await productsTable.update(productPayload).eq("id", input.id);

  if (error) {
    throw new Error(getAdminProductErrorMessage(error, "No se pudo actualizar el producto."));
  }

  await syncAdminProductInventory(client, input.id, input.stock);

  if (input.galleryImagePaths !== undefined) {
    await replaceAdminProductGallery(client, input.id, input.galleryImagePaths);
  }

  return {
    id: input.id,
    slug: nextSlug,
    brandSlug: brand.slug,
    categorySlug: category.slug,
    isPreorder: input.isPreorder,
  } satisfies AdminProductMutationResult;
}

export async function toggleAdminProductActive(id: string, nextActive: boolean) {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  await ensureAdminProductExists(client, id);
  const productsTable = client.from("products") as any;
  const { error } = await productsTable.update({ active: nextActive }).eq("id", id);

  if (error) {
    throw new Error(
      getAdminProductErrorMessage(
        error,
        "No se pudo cambiar el estado del producto.",
      ),
    );
  }

  return getAdminProductMutationMeta(client, id);
}

export async function updateAdminProductStock(productId: string, stock: number) {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  await ensureAdminProductExists(client, productId);
  await syncAdminProductInventory(client, productId, stock);

  return getAdminProductMutationMeta(client, productId);
}

export async function deleteAdminProduct(productId: string) {
  await requireAdminAccess();

  const client = createAdminProductsServiceClient();
  await ensureAdminProductExists(client, productId);
  const deletionMeta = await getAdminProductDeletionMeta(client, productId);
  const productsTable = client.from("products") as any;
  const { error } = await productsTable.delete().eq("id", productId);

  if (error) {
    throw new Error(getAdminProductErrorMessage(error, "No se pudo eliminar el producto."));
  }

  await cleanupDeletedProductStorage(client, deletionMeta.storagePaths);

  return deletionMeta.mutation;
}
