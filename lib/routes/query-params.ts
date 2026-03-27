import type {
  BrandSlug,
  ListingFilters,
  ProductCategorySlug,
  ProductLanguage,
  SortOption,
} from "@/types/store";

import { normalizeSlug } from "@/lib/routes/slugs";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export const collectionQueryParamKeys = {
  sort: "sort",
  brand: "brand",
  category: "category",
  expansion: "expansion",
  language: "language",
  priceMin: "priceMin",
  priceMax: "priceMax",
  inStock: "inStock",
  isPreorder: "isPreorder",
  featured: "featured",
} as const;

export const sortOptionValues = [
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
  "stock-desc",
] as const satisfies readonly SortOption[];

const brandSlugValues = [
  "pokemon",
  "one-piece",
  "riftbound",
  "magic",
  "accesorios",
  "preventa",
] as const satisfies readonly BrandSlug[];

const productCategorySlugValues = [
  "sobres",
  "etb",
  "blister-3-sobres",
  "booster-packs",
  "ediciones-especiales",
  "sobres-individuales",
  "cajas",
  "commander-decks",
  "booster-normales",
  "booster-coleccion",
  "fundas",
  "deck-boxes",
  "binders",
  "toploaders",
  "dados-tapetes",
  "cartas-individuales",
] as const satisfies readonly ProductCategorySlug[];

const productLanguageValues = ["ES", "EN", "JP"] as const satisfies readonly ProductLanguage[];

function getSearchParamValue(input: SearchParamsInput, key: string) {
  const value = input[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function parseCsv(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseEnumList<T extends readonly string[]>(value: string | undefined, allowed: T) {
  const allowedSet = new Set<string>(allowed);

  return parseCsv(value).filter((item): item is T[number] => allowedSet.has(item));
}

function parseNormalizedEnumList<T extends readonly string[]>(value: string | undefined, allowed: T) {
  const allowedSet = new Set<string>(allowed);

  return parseCsv(value)
    .map((item) => normalizeSlug(item))
    .filter((item): item is T[number] => allowedSet.has(item));
}

function parseExpansionList(value: string | undefined) {
  return parseCsv(value);
}

function parseNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBooleanFlag(value: string | undefined) {
  return value === "1" || value === "true";
}

export function parseCollectionFilters(searchParams: SearchParamsInput): ListingFilters {
  const requestedSort = getSearchParamValue(searchParams, collectionQueryParamKeys.sort);
  const sort: SortOption = sortOptionValues.includes(requestedSort as SortOption)
    ? (requestedSort as SortOption)
    : "featured";

  return {
    sort,
    brand: parseNormalizedEnumList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.brand),
      brandSlugValues,
    ),
    category: parseNormalizedEnumList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.category),
      productCategorySlugValues,
    ),
    expansion: parseExpansionList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.expansion),
    ),
    language: parseEnumList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.language),
      productLanguageValues,
    ),
    priceMin: parseNumber(getSearchParamValue(searchParams, collectionQueryParamKeys.priceMin)),
    priceMax: parseNumber(getSearchParamValue(searchParams, collectionQueryParamKeys.priceMax)),
    inStock: parseBooleanFlag(getSearchParamValue(searchParams, collectionQueryParamKeys.inStock)),
    isPreorder: parseBooleanFlag(
      getSearchParamValue(searchParams, collectionQueryParamKeys.isPreorder),
    ),
    featured: parseBooleanFlag(
      getSearchParamValue(searchParams, collectionQueryParamKeys.featured),
    ),
  };
}

export function buildCollectionQueryString(filters: Partial<ListingFilters>) {
  const params = new URLSearchParams();

  if (filters.sort) {
    params.set(collectionQueryParamKeys.sort, filters.sort);
  }

  if (filters.brand?.length) {
    params.set(collectionQueryParamKeys.brand, filters.brand.join(","));
  }

  if (filters.category?.length) {
    params.set(collectionQueryParamKeys.category, filters.category.join(","));
  }

  if (filters.expansion?.length) {
    params.set(collectionQueryParamKeys.expansion, filters.expansion.join(","));
  }

  if (filters.language?.length) {
    params.set(collectionQueryParamKeys.language, filters.language.join(","));
  }

  if (typeof filters.priceMin === "number") {
    params.set(collectionQueryParamKeys.priceMin, String(filters.priceMin));
  }

  if (typeof filters.priceMax === "number") {
    params.set(collectionQueryParamKeys.priceMax, String(filters.priceMax));
  }

  if (filters.inStock) {
    params.set(collectionQueryParamKeys.inStock, "1");
  }

  if (filters.isPreorder) {
    params.set(collectionQueryParamKeys.isPreorder, "1");
  }

  if (filters.featured) {
    params.set(collectionQueryParamKeys.featured, "1");
  }

  return params.toString();
}
