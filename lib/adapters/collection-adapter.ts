import {
  featuredAccessories,
  featuredSealed,
  featuredSingles,
  newArrivals,
  preorderProducts,
} from "@/data/products";
import { filterProducts, getListingFilterOptions, parseListingFilters } from "@/lib/catalog";
import { adaptProductsToCollectionItems } from "@/lib/adapters/product-adapter";
import { COLLECTION_PAGE_SIZE } from "@/lib/routes/query-params";
import type { CollectionFilterOption, CollectionResponse } from "@/types/contracts";
import type { Product } from "@/types/store";

type SearchParamsInput = Record<string, string | string[] | undefined>;

function countValues<T extends string>(items: T[]) {
  const counts = new Map<T, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  return counts;
}

function sortFilterOptions(options: CollectionFilterOption[]) {
  return options.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

export function buildCollectionResponse(
  baseProducts: Product[],
  searchParams: SearchParamsInput,
): CollectionResponse {
  const query = parseListingFilters(searchParams);
  const filteredItems = filterProducts(baseProducts, query);
  const pageCount =
    filteredItems.length > 0 ? Math.ceil(filteredItems.length / COLLECTION_PAGE_SIZE) : 0;
  const currentPage =
    pageCount > 0 ? Math.min(Math.max(query.page, 1), pageCount) : 1;
  const sliceStart = (currentPage - 1) * COLLECTION_PAGE_SIZE;
  const paginatedItems = filteredItems.slice(
    sliceStart,
    sliceStart + COLLECTION_PAGE_SIZE,
  );
  const filterOptions = getListingFilterOptions(baseProducts);

  const brandCounts = countValues(baseProducts.map((product) => product.brand));
  const categoryCounts = countValues(baseProducts.map((product) => product.category));
  const expansionCounts = countValues(
    baseProducts
      .map((product) => product.expansionSlug)
      .filter((expansion): expansion is string => Boolean(expansion)),
  );
  const formatCounts = countValues(
    baseProducts
      .map((product) => product.formatSlug)
      .filter((expansion): expansion is string => Boolean(expansion)),
  );
  const languageCounts = countValues(
    baseProducts
      .map((product) => product.language)
      .filter((language): language is NonNullable<Product["language"]> => Boolean(language)),
  );

  return {
    items: adaptProductsToCollectionItems(paginatedItems),
    total: filteredItems.length,
    query: {
      ...query,
      page: currentPage,
    },
    pagination: {
      page: currentPage,
      pageSize: COLLECTION_PAGE_SIZE,
      pageCount,
      hasNextPage: pageCount > 0 && currentPage < pageCount,
      hasPreviousPage: currentPage > 1,
    },
    filters: {
      brands: sortFilterOptions(
        filterOptions.brands.map((brand) => ({
          value: brand.slug,
          label: brand.label,
          count: brandCounts.get(brand.slug) ?? 0,
        })),
      ),
      categories: sortFilterOptions(
        filterOptions.categories.map((category) => ({
          value: category.slug,
          label: category.label,
          count: categoryCounts.get(category.slug) ?? 0,
        })),
      ),
      expansions: sortFilterOptions(
        filterOptions.expansions.map((expansion) => ({
          value: expansion.slug,
          label: expansion.label,
          count: expansionCounts.get(expansion.slug) ?? 0,
        })),
      ),
      formats: sortFilterOptions(
        filterOptions.formats.map((format) => ({
          value: format.slug,
          label: format.label,
          count: formatCounts.get(format.slug) ?? 0,
        })),
      ),
      languages: sortFilterOptions(
        filterOptions.languages.map((language) => ({
          value: language,
          label: language,
          count: languageCounts.get(language) ?? 0,
        })),
      ),
      price: filterOptions.price,
    },
  };
}

export function getHomeCollections() {
  const featuredSealedItems = adaptProductsToCollectionItems(featuredSealed);
  const featuredSinglesItems = adaptProductsToCollectionItems(featuredSingles);

  return {
    heroProducts: [featuredSealedItems[0], featuredSinglesItems[0]].filter(
      (product): product is NonNullable<typeof featuredSealedItems[number]> => Boolean(product),
    ),
    newArrivals: adaptProductsToCollectionItems(newArrivals),
    preorderProducts: adaptProductsToCollectionItems(preorderProducts),
    featuredSingles: featuredSinglesItems,
    featuredSealed: featuredSealedItems,
    featuredAccessories: adaptProductsToCollectionItems(featuredAccessories),
  };
}
