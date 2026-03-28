export type BrandSlug =
  | "pokemon"
  | "one-piece"
  | "riftbound"
  | "magic"
  | "accesorios"
  | "preventa";

export type ProductType = "sealed" | "single" | "accessory";

export type ProductCategorySlug =
  | "sobres"
  | "etb"
  | "blister-3-sobres"
  | "booster-packs"
  | "ediciones-especiales"
  | "sobres-individuales"
  | "cajas"
  | "commander-decks"
  | "booster-normales"
  | "booster-coleccion"
  | "fundas"
  | "deck-boxes"
  | "binders"
  | "toploaders"
  | "dados-tapetes"
  | "cartas-individuales";

export type ProductLanguage = "ES" | "EN" | "JP";

export type ProductCondition = "NM" | "EX" | "LP" | "GD";

export interface BrandCategory {
  id: string;
  label: string;
  slug: ProductCategorySlug;
  description: string;
  href: string;
}

export interface BrandTheme {
  from: string;
  via: string;
  to: string;
  glow: string;
}

export interface Brand {
  id: BrandSlug;
  slug: BrandSlug;
  name: string;
  shortName: string;
  href: string;
  tagline: string;
  description: string;
  spotlight: string;
  categories: BrandCategory[];
  theme: BrandTheme;
}

export interface Product {
  id: string;
  slug: string;
  type: ProductType;
  name: string;
  brand: BrandSlug;
  category: ProductCategorySlug;
  description: string;
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
  images: string[];
  tags: string[];
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  href: string;
  image: string;
  theme: BrandTheme;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
}

export interface NavLinkItem {
  label: string;
  href: string;
  description?: string;
}

export interface FooterLinkGroup {
  title: string;
  links: NavLinkItem[];
}

export type SortOption =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "stock-desc";

export interface ListingFilters {
  brand: BrandSlug[];
  category: ProductCategorySlug[];
  expansion: string[];
  language: ProductLanguage[];
  priceMin?: number;
  priceMax?: number;
  inStock: boolean;
  isPreorder: boolean;
  featured: boolean;
  sort: SortOption;
}

export interface StoredCartItem {
  productId: string;
  quantity: number;
  snapshot?: StoredCartItemSnapshot;
}

export interface StoredCartItemSnapshot {
  slug: string;
  href: string;
  name: string;
  description: string;
  image: string;
  brandLabel: string;
  expansion?: string;
  unitPrice: number;
  stock: number;
  isPreorder: boolean;
}
