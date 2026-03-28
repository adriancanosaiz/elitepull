import type {
  ListingFilters,
  ProductLanguage,
  SortOption,
} from "@/types/store";

import { normalizeSlug } from "@/lib/routes/slugs";

export type SearchParamsInput = Record<string, string | string[] | undefined>;

export const collectionQueryParamKeys = {
  page: "page",
  sort: "sort",
  brand: "brand",
  category: "category",
  expansion: "expansion",
  format: "format",
  language: "language",
  priceMin: "priceMin",
  priceMax: "priceMax",
  inStock: "inStock",
  isPreorder: "isPreorder",
  featured: "featured",
} as const;

export const COLLECTION_DEFAULT_PAGE = 1;
export const COLLECTION_PAGE_SIZE = 18;

export const sortOptionValues = [
  "featured",
  "price-asc",
  "price-desc",
  "name-asc",
  "stock-desc",
] as const satisfies readonly SortOption[];

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

function parseNormalizedList(value: string | undefined) {
  return parseCsv(value).map((item) => normalizeSlug(item)).filter(Boolean);
}

function parseLanguageList(value: string | undefined) {
  const allowedSet = new Set<string>(productLanguageValues);

  return parseCsv(value).filter((item): item is ProductLanguage => allowedSet.has(item));
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

function parsePage(value: string | undefined) {
  if (!value) {
    return COLLECTION_DEFAULT_PAGE;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return COLLECTION_DEFAULT_PAGE;
  }

  return parsed;
}

export function parseCollectionFilters(searchParams: SearchParamsInput): ListingFilters {
  const requestedSort = getSearchParamValue(searchParams, collectionQueryParamKeys.sort);
  const sort: SortOption = sortOptionValues.includes(requestedSort as SortOption)
    ? (requestedSort as SortOption)
    : "featured";

  return {
    page: parsePage(getSearchParamValue(searchParams, collectionQueryParamKeys.page)),
    sort,
    brand: parseNormalizedList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.brand),
    ),
    category: parseNormalizedList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.category),
    ),
    expansion: parseNormalizedList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.expansion),
    ),
    format: parseNormalizedList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.format),
    ),
    language: parseLanguageList(
      getSearchParamValue(searchParams, collectionQueryParamKeys.language),
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

  if (typeof filters.page === "number" && filters.page > COLLECTION_DEFAULT_PAGE) {
    params.set(collectionQueryParamKeys.page, String(filters.page));
  }

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

  if (filters.format?.length) {
    params.set(collectionQueryParamKeys.format, filters.format.join(","));
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
