import { brandsBySlug } from "@/data/brands";
import { products } from "@/data/products";
import { getCategoryLabel, getRelatedProducts } from "@/lib/catalog";
import { getProductRoute } from "@/lib/routes/store-routes";
import type { CollectionItem, ProductCardItem, ProductDetail } from "@/types/contracts";
import type { Product } from "@/types/store";

function adaptBrand(product: Product) {
  const brand = brandsBySlug[product.brand];

  return {
    slug: brand.slug,
    label: brand.shortName,
    href: brand.href,
  };
}

function adaptCategory(product: Product) {
  const brand = brandsBySlug[product.brand];
  const category = brand.categories.find((entry) => entry.slug === product.category);

  return {
    slug: product.category,
    label: category?.label ?? getCategoryLabel(product.category),
    href: category?.href,
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
    language: product.language,
    rarity: product.rarity,
    condition: product.condition,
    badge: product.badge,
    image: product.image,
    tags: product.tags,
  };
}

export function adaptProductToDetail(product: Product): ProductDetail {
  return {
    ...adaptProductToCardItem(product),
    images: product.images,
    stockLabel: getStockLabel(product),
    details: [
      {
        label: "Expansion",
        value: product.expansion ?? "Seleccion premium",
      },
      {
        label: "Idioma",
        value: product.language ?? "No aplica",
      },
      {
        label: "Rareza",
        value: product.rarity ?? "No aplica",
      },
      {
        label: "Estado",
        value: product.condition ?? "Sellado",
      },
    ],
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
