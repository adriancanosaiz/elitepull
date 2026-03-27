import { createSupabaseServerClient } from "@/lib/supabase/server";
import { normalizeProductMediaPath } from "@/lib/supabase/storage";
import { requireAdminAccess } from "@/lib/auth/admin";
import type { Database, Json } from "@/lib/supabase/database.types";
import type {
  AdminProductAttributesInput,
  AdminProductInput,
} from "@/lib/validators/admin-product";
import type { ProductType } from "@/types/store";

type CategoryRow = Pick<
  Database["public"]["Tables"]["categories"]["Row"],
  "id" | "slug" | "label" | "brand_slug" | "sort_order" | "active"
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

type AdminProductRecord = ProductRow & {
  category: CategoryRow | null;
  inventory: InventoryRow | InventoryRow[] | null;
  images: ProductImageRow[] | null;
};

export type AdminCategoryOption = {
  id: string;
  brandSlug: AdminProductInput["brandSlug"];
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
  brandSlug: AdminProductInput["brandSlug"];
  categoryId: string;
  categoryLabel: string;
  categorySlug: string;
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

export type AdminProductDetail = AdminProductInput & {
  id: string;
  categoryLabel: string;
  categorySlug: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminProductMutationResult = {
  id: string;
  slug: string;
  brandSlug: AdminProductInput["brandSlug"];
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
  category_id,
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
  category:categories!products_category_id_fkey (
    id,
    slug,
    label,
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
    expansion: typeof attributes.expansion === "string" ? attributes.expansion : undefined,
    language:
      attributes.language === "ES" ||
      attributes.language === "EN" ||
      attributes.language === "JP"
        ? attributes.language
        : undefined,
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
    brandSlug: record.brand_slug as AdminProductInput["brandSlug"],
    categoryId: record.category_id,
    categoryLabel: record.category?.label ?? "Sin categoria",
    categorySlug: record.category?.slug ?? "",
    productType: record.product_type as ProductType,
    price: record.price,
    compareAtPrice: record.compare_at_price ?? undefined,
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
    brandSlug: record.brand_slug as AdminProductInput["brandSlug"],
    categoryId: record.category_id,
    categoryLabel: record.category?.label ?? "Sin categoria",
    categorySlug: record.category?.slug ?? "",
    price: record.price,
    compareAtPrice: record.compare_at_price ?? undefined,
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

async function getValidatedAdminCategory(
  categoryId: string,
  brandSlug: AdminProductInput["brandSlug"],
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, label, brand_slug, sort_order, active")
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

async function syncAdminProductInventory(productId: string, stock: number) {
  const supabase = await createSupabaseServerClient();
  const inventoryTable = supabase.from("inventory") as any;
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
    throw new Error(`[admin-products] No se pudo actualizar el stock: ${error.message}`);
  }
}

async function replaceAdminProductGallery(productId: string, galleryImagePaths: string[]) {
  const supabase = await createSupabaseServerClient();
  const productImagesTable = supabase.from("product_images") as any;
  const normalizedPaths = galleryImagePaths
    .map((path) => normalizeProductMediaPath(path))
    .filter((path): path is string => Boolean(path));

  const { error: deleteError } = await productImagesTable.delete().eq("product_id", productId);

  if (deleteError) {
    throw new Error(`[admin-products] No se pudo resetear la galeria: ${deleteError.message}`);
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
    throw new Error(`[admin-products] No se pudo guardar la galeria: ${insertError.message}`);
  }
}

async function getAdminProductMutationMeta(productId: string): Promise<AdminProductMutationResult> {
  const supabase = await createSupabaseServerClient();
  const productsTable = supabase.from("products") as any;
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
    throw new Error(`[admin-products] No se pudo resolver el producto actualizado: ${error.message}`);
  }

  const row = data as {
    id: string;
    slug: string;
    brand_slug: AdminProductInput["brandSlug"];
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

export async function getAdminProductsList(search?: string) {
  await requireAdminAccess();

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("updated_at", { ascending: false });

  const normalizedSearch = search?.trim();

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

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
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

  const supabase = await createSupabaseServerClient();
  const categoriesTable = supabase.from("categories") as any;
  const { data, error } = await categoriesTable
    .select("id, brand_slug, slug, label, description, sort_order")
    .eq("active", true)
    .order("brand_slug", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`[admin-products] No se pudieron cargar las categorias: ${error.message}`);
  }

  const rows = (data ?? []) as Array<{
    id: string;
    brand_slug: AdminProductInput["brandSlug"];
    slug: string;
    label: string;
    description: string | null;
    sort_order: number;
  }>;

  return rows.map((category) => ({
    id: category.id,
    brandSlug: category.brand_slug,
    slug: category.slug,
    label: category.label,
    description: category.description,
    sortOrder: category.sort_order,
  })) as AdminCategoryOption[];
}

export async function createAdminProduct(input: AdminProductInput) {
  await requireAdminAccess();

  const supabase = await createSupabaseServerClient();
  const productsTable = supabase.from("products") as any;
  const productId = input.id ?? crypto.randomUUID();
  const category = await getValidatedAdminCategory(input.categoryId, input.brandSlug);

  const productPayload: Database["public"]["Tables"]["products"]["Insert"] = {
    id: productId,
    slug: input.slug,
    sku: input.sku,
    name: input.name,
    description: input.description,
    product_type: input.productType,
    brand_slug: input.brandSlug,
    category_id: input.categoryId,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    featured: input.featured,
    is_preorder: input.isPreorder,
    active: input.active,
    main_image_path: input.coverImagePath
      ? normalizeProductMediaPath(input.coverImagePath) || null
      : null,
    attributes: input.attributes,
    tags: input.tags,
  };

  const { error } = await productsTable.insert(productPayload);

  if (error) {
    throw new Error(`[admin-products] No se pudo crear el producto: ${error.message}`);
  }

  await syncAdminProductInventory(productId, input.stock);
  await replaceAdminProductGallery(productId, input.galleryImagePaths);

  return {
    id: productId,
    slug: input.slug,
    brandSlug: input.brandSlug,
    categorySlug: category.slug,
    isPreorder: input.isPreorder,
  } satisfies AdminProductMutationResult;
}

export async function updateAdminProduct(input: AdminProductInput) {
  await requireAdminAccess();

  if (!input.id) {
    throw new Error("No se puede actualizar un producto sin id.");
  }

  const supabase = await createSupabaseServerClient();
  const productsTable = supabase.from("products") as any;
  const category = await getValidatedAdminCategory(input.categoryId, input.brandSlug);

  const productPayload: Database["public"]["Tables"]["products"]["Update"] = {
    slug: input.slug,
    sku: input.sku,
    name: input.name,
    description: input.description,
    product_type: input.productType,
    brand_slug: input.brandSlug,
    category_id: input.categoryId,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    featured: input.featured,
    is_preorder: input.isPreorder,
    active: input.active,
    main_image_path: input.coverImagePath
      ? normalizeProductMediaPath(input.coverImagePath) || null
      : null,
    attributes: input.attributes,
    tags: input.tags,
  };

  const { error } = await productsTable.update(productPayload).eq("id", input.id);

  if (error) {
    throw new Error(`[admin-products] No se pudo actualizar el producto: ${error.message}`);
  }

  await syncAdminProductInventory(input.id, input.stock);
  await replaceAdminProductGallery(input.id, input.galleryImagePaths);

  return {
    id: input.id,
    slug: input.slug,
    brandSlug: input.brandSlug,
    categorySlug: category.slug,
    isPreorder: input.isPreorder,
  } satisfies AdminProductMutationResult;
}

export async function toggleAdminProductActive(id: string, nextActive: boolean) {
  await requireAdminAccess();

  const supabase = await createSupabaseServerClient();
  const productsTable = supabase.from("products") as any;
  const { error } = await productsTable.update({ active: nextActive }).eq("id", id);

  if (error) {
    throw new Error(`[admin-products] No se pudo cambiar el estado del producto: ${error.message}`);
  }

  return getAdminProductMutationMeta(id);
}

export async function updateAdminProductStock(productId: string, stock: number) {
  await requireAdminAccess();

  await syncAdminProductInventory(productId, stock);

  return getAdminProductMutationMeta(productId);
}
