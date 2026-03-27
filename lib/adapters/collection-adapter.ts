import {
  featuredAccessories,
  featuredSealed,
  featuredSingles,
  newArrivals,
  preorderProducts,
} from "@/data/products";
import { filterProducts, getListingFilterOptions, parseListingFilters } from "@/lib/catalog";
import { adaptProductsToCollectionItems } from "@/lib/adapters/product-adapter";
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
  const items = filterProducts(baseProducts, query);
  const filterOptions = getListingFilterOptions(baseProducts);

  const brandCounts = countValues(baseProducts.map((product) => product.brand));
  const categoryCounts = countValues(baseProducts.map((product) => product.category));
  const expansionCounts = countValues(
    baseProducts
      .map((product) => product.expansion)
      .filter((expansion): expansion is string => Boolean(expansion)),
  );
  const languageCounts = countValues(
    baseProducts
      .map((product) => product.language)
      .filter((language): language is NonNullable<Product["language"]> => Boolean(language)),
  );

  return {
    items: adaptProductsToCollectionItems(items),
    total: items.length,
    query,
    filters: {
      brands: sortFilterOptions(
        filterOptions.brands.map((brand) => ({
          value: brand.slug,
          label: brand.shortName,
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
          value: expansion,
          label: expansion,
          count: expansionCounts.get(expansion) ?? 0,
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
