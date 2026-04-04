import { brandsBySlug } from "@/data/brands";
import { products } from "@/data/products";
import { getCategoryLabel, getRelatedProducts } from "@/lib/catalog";
import {
  getBrandRoute,
  getCategoryRoute,
  getProductRoute,
} from "@/lib/routes/store-routes";
import type { CollectionItem, ProductCardItem, ProductDetail } from "@/types/contracts";
import type { Product } from "@/types/store";

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function adaptBrand(product: Product) {
  const brand = brandsBySlug[product.brand];
  const label = product.brandLabel ?? brand?.shortName ?? humanizeSlug(product.brand);

  return {
    slug: product.brand,
    label,
    href: brand?.href ?? getBrandRoute(product.brand),
  };
}

function adaptCategory(product: Product) {
  const brand = brandsBySlug[product.brand];
  const categorySlug = product.formatSlug ?? product.category;
  const category = brand?.categories.find((entry) => entry.slug === categorySlug);
  const label =
    product.format ?? product.categoryLabel ?? category?.label ?? getCategoryLabel(categorySlug);

  return {
    slug: categorySlug,
    label,
    href: category?.href ?? getCategoryRoute(product.brand, categorySlug),
  };
}

function getStockLabel(product: Product) {
  if (product.isPreorder) {
    return "Reserva abierta";
  }

  if (product.stock > 0) {
    return `${product.stock} unidades disponibles`;
  }

  return "Sin stock inmediato";
}

export function adaptProductToCardItem(product: Product): ProductCardItem {
  return {
    id: product.id,
    slug: product.slug,
    href: getProductRoute(product.slug),
    type: product.type,
    name: product.name,
    description: product.description,
    brand: adaptBrand(product),
    category: adaptCategory(product),
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    featured: product.featured,
    isPreorder: product.isPreorder,
    expansion: product.expansion,
    expansionSlug: product.expansionSlug,
    format: product.format,
    formatSlug: product.formatSlug,
    language: product.language,
    variant: product.variant,
    rarity: product.rarity,
    condition: product.condition,
    badge: product.badge,
    image: product.image,
    tags: product.tags,
  };
}

export function adaptProductToDetail(product: Product): ProductDetail {
  const details = [
    {
      label: "Marca",
      value: product.brandLabel ?? humanizeSlug(product.brand),
    },
    {
      label: "Expansion",
      value: product.expansion ?? "General",
    },
    {
      label: "Formato",
      value: product.format ?? adaptCategory(product).label,
    },
    {
      label: "Idioma",
      value: product.language ?? "ES",
    },
  ];

  if (product.variant) {
    details.push({
      label: "Variante",
      value: product.variant,
    });
  }

  details.push(
    {
      label: "Rareza",
      value: product.rarity ?? "No aplica",
    },
    {
      label: "Estado",
      value: product.condition ?? "Sellado",
    },
  );

  return {
    ...adaptProductToCardItem(product),
    images: product.images,
    imageAlts: product.imageAlts,
    stockLabel: getStockLabel(product),
    details,
  };
}

export function adaptProductsToCollectionItems(input: Product[]): CollectionItem[] {
  return input.map((product) => adaptProductToCardItem(product));
}

export function getProductDetailBySlug(slug: string) {
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    return undefined;
  }

  return adaptProductToDetail(product);
}

export function getRelatedProductCardsBySlug(slug: string, limit = 4) {
  const product = products.find((entry) => entry.slug === slug);

  if (!product) {
    return [];
  }

  return adaptProductsToCollectionItems(getRelatedProducts(product, limit));
}
