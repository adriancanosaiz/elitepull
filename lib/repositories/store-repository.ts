import { cache } from "react";

import {
  adaptProductToDetail,
  adaptProductsToCollectionItems,
  buildCollectionResponse,
  getHomeCollections,
  getProductDetailBySlug as getMockProductDetailBySlug,
  getRelatedProductCardsBySlug as getMockRelatedProductCardsBySlug,
} from "@/lib/adapters";
import {
  adaptSupabaseProductRecord,
  type SupabaseProductRecord,
} from "@/lib/adapters/supabase-product-adapter";
import { products as mockProducts } from "@/data/products";
import {
  canUseMockFallbacks,
  formatSupabaseEnvErrorMessage,
  getSupabaseEnvStatus,
  isBuildEnvironment,
} from "@/lib/env";
import { getScopedCollection } from "@/lib/catalog";
import { getSupabaseServerClient } from "@/lib/supabase/client";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import {
  collectionResponseSchema,
  productCardItemSchema,
  productDetailSchema,
} from "@/lib/validators/contracts";
import type {
  CollectionItem,
  CollectionResponse,
  ProductCardItem,
  ProductDetail,
} from "@/types/contracts";
import type { BrandSlug, Product, ProductCategorySlug } from "@/types/store";

const PRODUCT_SELECT = `
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
    brand_slug
  ),
  images:product_images (
    storage_path,
    sort_order,
    is_primary
  ),
  inventory:inventory (
    available_quantity
  )
`;

const warnedFallbackKeys = new Set<string>();

export type CollectionRepositoryInput = {
  searchParams?: SearchParamsInput;
  brand?: BrandSlug;
  category?: ProductCategorySlug;
  preorderOnly?: boolean;
  accessoriesOnly?: boolean;
};

export type HomeData = {
  heroProducts: ProductCardItem[];
  newArrivals: CollectionItem[];
  preorderProducts: CollectionItem[];
  featuredSingles: CollectionItem[];
  featuredSealed: CollectionItem[];
  featuredAccessories: CollectionItem[];
};

function getFallbackSuffix() {
  return isBuildEnvironment()
    ? " Se usaran mocks locales solo para este build."
    : " Se usaran mocks locales solo en desarrollo.";
}

function warnMockFallbackOnce(key: string, message: string) {
  if (warnedFallbackKeys.has(key)) {
    return;
  }

  warnedFallbackKeys.add(key);
  console.warn(`${message}${getFallbackSuffix()}`);
}

function resolveCatalogSourceFailure(key: string, message: string): null {
  if (!canUseMockFallbacks()) {
    throw new Error(message);
  }

  warnMockFallbackOnce(key, message);
  return null;
}

function getMockScopedProducts(input: CollectionRepositoryInput) {
  return getScopedCollection({
    brand: input.brand,
    category: input.category,
    preorderOnly: input.preorderOnly,
    accessoriesOnly: input.accessoriesOnly,
  });
}

function scopeProducts(products: Product[], input: CollectionRepositoryInput) {
  return products.filter((product) => {
    if (input.brand && product.brand !== input.brand) {
      return false;
    }

    if (input.category && product.category !== input.category) {
      return false;
    }

    if (input.preorderOnly && !product.isPreorder) {
      return false;
    }

    if (input.accessoriesOnly && product.brand !== "accesorios") {
      return false;
    }

    return true;
  });
}

function buildHomeDataFromProducts(products: Product[]): HomeData {
  const featuredSealed = adaptProductsToCollectionItems(
    products.filter((product) => product.type === "sealed" && product.featured).slice(0, 4),
  );
  const featuredSingles = adaptProductsToCollectionItems(
    products.filter((product) => product.type === "single" && product.featured).slice(0, 4),
  );
  const featuredAccessories = adaptProductsToCollectionItems(
    products
      .filter(
        (product) => product.brand === "accesorios" && (product.featured || product.stock > 0),
      )
      .slice(0, 4),
  );
  const preorderProducts = adaptProductsToCollectionItems(
    products.filter((product) => product.isPreorder).slice(0, 4),
  );
  const newArrivals = adaptProductsToCollectionItems(products.slice(0, 8));

  return {
    heroProducts: [featuredSealed[0], featuredSingles[0]]
      .filter((product): product is ProductCardItem => Boolean(product))
      .map((item) => productCardItemSchema.parse(item)),
    newArrivals: newArrivals.map((item) => productCardItemSchema.parse(item)),
    preorderProducts: preorderProducts.map((item) => productCardItemSchema.parse(item)),
    featuredSingles: featuredSingles.map((item) => productCardItemSchema.parse(item)),
    featuredSealed: featuredSealed.map((item) => productCardItemSchema.parse(item)),
    featuredAccessories: featuredAccessories.map((item) => productCardItemSchema.parse(item)),
  };
}

function validateHomeData(data: HomeData): HomeData {
  return {
    heroProducts: data.heroProducts.map((item) => productCardItemSchema.parse(item)),
    newArrivals: data.newArrivals.map((item) => productCardItemSchema.parse(item)),
    preorderProducts: data.preorderProducts.map((item) => productCardItemSchema.parse(item)),
    featuredSingles: data.featuredSingles.map((item) => productCardItemSchema.parse(item)),
    featuredSealed: data.featuredSealed.map((item) => productCardItemSchema.parse(item)),
    featuredAccessories: data.featuredAccessories.map((item) =>
      productCardItemSchema.parse(item),
    ),
  };
}

const getSupabaseProducts = cache(async (): Promise<Product[] | null> => {
  const envStatus = getSupabaseEnvStatus();

  if (envStatus.kind !== "configured") {
    return resolveCatalogSourceFailure(
      `env-${envStatus.kind}`,
      formatSupabaseEnvErrorMessage(envStatus),
    );
  }

  const client = getSupabaseServerClient();

  if (!client) {
    return resolveCatalogSourceFailure(
      "client-unavailable",
      "[store-repository] No se pudo crear el cliente de Supabase para el catalogo publico.",
    );
  }

  try {
    const { data, error } = await client
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .order("updated_at", { ascending: false });

    if (error) {
      return resolveCatalogSourceFailure(
        "query-error",
        `[store-repository] Error al cargar productos desde Supabase: ${error.message}`,
      );
    }

    return ((data as SupabaseProductRecord[] | null) ?? []).map((record) =>
      adaptSupabaseProductRecord(record),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido consultando Supabase";

    return resolveCatalogSourceFailure(
      "unexpected-error",
      `[store-repository] Fallo inesperado al cargar el catalogo desde Supabase: ${message}`,
    );
  }
});

export async function getHomeData(): Promise<HomeData> {
  const supabaseProducts = await getSupabaseProducts();

  if (!supabaseProducts) {
    return validateHomeData(getHomeCollections());
  }

  return validateHomeData(buildHomeDataFromProducts(supabaseProducts));
}

export async function getCollectionData(
  input: CollectionRepositoryInput = {},
): Promise<CollectionResponse> {
  const supabaseProducts = await getSupabaseProducts();

  if (!supabaseProducts) {
    return collectionResponseSchema.parse(
      buildCollectionResponse(getMockScopedProducts(input), input.searchParams ?? {}),
    );
  }

  return collectionResponseSchema.parse(
    buildCollectionResponse(scopeProducts(supabaseProducts, input), input.searchParams ?? {}),
  );
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabaseProducts = await getSupabaseProducts();

  if (!supabaseProducts) {
    const mockProduct = getMockProductDetailBySlug(slug);

    return mockProduct ? productDetailSchema.parse(mockProduct) : null;
  }

  const product = supabaseProducts.find((entry) => entry.slug === slug);

  if (!product) {
    return null;
  }

  return productDetailSchema.parse(adaptProductToDetail(product));
}

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<CollectionItem[]> {
  const supabaseProducts = await getSupabaseProducts();

  if (!supabaseProducts) {
    const product = mockProducts.find((entry) => entry.id === productId);

    return product
      ? getMockRelatedProductCardsBySlug(product.slug, limit).map((item) =>
          productCardItemSchema.parse(item),
        )
      : [];
  }

  const product = supabaseProducts.find((entry) => entry.id === productId);

  if (!product) {
    return [];
  }

  return adaptProductsToCollectionItems(
    supabaseProducts
      .filter(
        (candidate) =>
          candidate.id !== product.id &&
          (candidate.brand === product.brand || candidate.category === product.category),
      )
      .slice(0, limit),
  ).map((item) => productCardItemSchema.parse(item));
}
