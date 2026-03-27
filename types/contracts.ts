import type {
  BrandSlug,
  ProductCategorySlug,
  ProductCondition,
  ProductLanguage,
  ProductType,
  SortOption,
} from "@/types/store";

export interface ProductReference {
  slug: BrandSlug;
  label: string;
  href: string;
}

export interface CategoryReference {
  slug: ProductCategorySlug;
  label: string;
  href?: string;
}

export interface ProductCardItem {
  id: string;
  slug: string;
  href: string;
  type: ProductType;
  name: string;
  description: string;
  brand: ProductReference;
  category: CategoryReference;
  price: number;
  compareAtPrice?: number;
  stock: number;
  featured: boolean;
  isPreorder: boolean;
  expansion?: string;
  language?: ProductLanguage;
  rarity?: string;
  condition?: ProductCondition;
  badge?: string;
  image: string;
  tags: string[];
}

export interface ProductDetail extends ProductCardItem {
  images: string[];
  stockLabel: string;
  details: Array<{
    label: string;
    value: string;
  }>;
}

export interface CollectionItem extends ProductCardItem {}

export interface CollectionFilterOption {
  value: string;
  label: string;
  count: number;
}

export interface CollectionQuery {
  sort: SortOption;
  brand: BrandSlug[];
  category: ProductCategorySlug[];
  expansion: string[];
  language: ProductLanguage[];
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  isPreorder: boolean;
  featured: boolean;
}

export interface CollectionResponse {
  items: CollectionItem[];
  total: number;
  query: CollectionQuery;
  filters: {
    brands: CollectionFilterOption[];
    categories: CollectionFilterOption[];
    expansions: CollectionFilterOption[];
    languages: CollectionFilterOption[];
    price: {
      min: number;
      max: number;
    };
  };
}

export interface CartItem {
  productId: string;
  slug: string;
  href: string;
  name: string;
  description: string;
  image: string;
  brandLabel: string;
  expansion?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  stock: number;
  isPreorder: boolean;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
  isEmpty: boolean;
}
