import type { CollectionRepositoryInput } from "@/lib/repositories/store-repository";
import type { SearchParamsInput } from "@/lib/routes/query-params";
import type { BrandSlug, ProductCategorySlug } from "@/types/store";

export function buildCollectionRepositoryInput({
  searchParams,
  brand,
  category,
  preorderOnly,
  accessoriesOnly,
}: {
  searchParams: SearchParamsInput;
  brand?: BrandSlug;
  category?: ProductCategorySlug;
  preorderOnly?: boolean;
  accessoriesOnly?: boolean;
}): CollectionRepositoryInput {
  return {
    searchParams,
    brand,
    category,
    preorderOnly,
    accessoriesOnly,
  };
}
