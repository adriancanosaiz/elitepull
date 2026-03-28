import { brands, brandsBySlug } from "@/data/brands";
import { products } from "@/data/products";
import {
  parseCollectionFilters,
  type SearchParamsInput,
} from "@/lib/routes/query-params";
import type {
  Brand,
  BrandSlug,
  ListingFilters,
  Product,
  ProductCategorySlug,
  ProductLanguage,
  SortOption,
} from "@/types/store";

export const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Destacados" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "stock-desc", label: "Mayor stock" },
];

export const priceRanges = [
  { min: 0, max: 25, label: "Hasta 25 EUR" },
  { min: 25, max: 75, label: "25 EUR - 75 EUR" },
  { min: 75, max: 150, label: "75 EUR - 150 EUR" },
  { min: 150, label: "150 EUR +" },
] as const;

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function getBrandBySlug(slug: BrandSlug) {
  return brandsBySlug[slug];
}

export function getBrandCategories(slug: BrandSlug) {
  return brandsBySlug[slug]?.categories ?? [];
}

export function getCategoryLabel(categorySlug: ProductCategorySlug) {
  for (const brand of brands) {
    const category = brand.categories.find((entry) => entry.slug === categorySlug);
    if (category) {
      return category.label;
    }
  }

  return humanizeSlug(categorySlug);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductsByBrand(brandSlug: BrandSlug) {
  return products.filter((product) => product.brand === brandSlug);
}

export function getProductsByCategory(categorySlug: ProductCategorySlug) {
  return products.filter((product) => product.category === categorySlug);
}

export function getRelatedProducts(product: Product, limit = 4) {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.brand === product.brand ||
          candidate.category === product.category ||
          candidate.expansionSlug === product.expansionSlug),
    )
    .slice(0, limit);
}

export function parseListingFilters(searchParams: SearchParamsInput): ListingFilters {
  return parseCollectionFilters(searchParams);
}

export function filterProducts(input: Product[], filters: ListingFilters) {
  const filtered = input.filter((product) => {
    if (filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
      return false;
    }

    if (filters.category.length > 0 && !filters.category.includes(product.category)) {
      return false;
    }

    if (
      filters.expansion.length > 0 &&
      (!product.expansionSlug || !filters.expansion.includes(product.expansionSlug))
    ) {
      return false;
    }

    if (
      filters.format.length > 0 &&
      (!product.formatSlug || !filters.format.includes(product.formatSlug))
    ) {
      return false;
    }

    if (
      filters.language.length > 0 &&
      (!product.language || !filters.language.includes(product.language))
    ) {
      return false;
    }

    if (filters.inStock && product.stock < 1) {
      return false;
    }

    if (filters.isPreorder && !product.isPreorder) {
      return false;
    }

    if (filters.featured && !product.featured) {
      return false;
    }

    if (typeof filters.priceMin === "number" && product.price < filters.priceMin) {
      return false;
    }

    if (typeof filters.priceMax === "number" && product.price > filters.priceMax) {
      return false;
    }

    return true;
  });

  return sortProducts(filtered, filters.sort);
}

export function sortProducts(input: Product[], sort: SortOption) {
  const items = [...input];

  if (sort === "price-asc") {
    return items.sort((a, b) => a.price - b.price);
  }

  if (sort === "price-desc") {
    return items.sort((a, b) => b.price - a.price);
  }

  if (sort === "name-asc") {
    return items.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  if (sort === "stock-desc") {
    return items.sort((a, b) => b.stock - a.stock);
  }

  return items.sort((a, b) => {
    if (Number(b.featured) !== Number(a.featured)) {
      return Number(b.featured) - Number(a.featured);
    }

    if (Number(b.isPreorder) !== Number(a.isPreorder)) {
      return Number(b.isPreorder) - Number(a.isPreorder);
    }

    return b.price - a.price;
  });
}

export function getListingFilterOptions(input: Product[]) {
  const prices = input.map((product) => product.price);
  const brandsMap = new Map<string, { slug: string; label: string }>();
  const categoriesMap = new Map<string, { slug: string; label: string }>();
  const expansionsMap = new Map<string, string>();
  const formatsMap = new Map<string, string>();
  const languages = new Set<ProductLanguage>();

  for (const product of input) {
    brandsMap.set(product.brand, {
      slug: product.brand,
      label: product.brandLabel ?? humanizeSlug(product.brand),
    });
    categoriesMap.set(product.category, {
      slug: product.category,
      label: product.categoryLabel ?? getCategoryLabel(product.category),
    });

    if (product.expansionSlug && product.expansion) {
      expansionsMap.set(product.expansionSlug, product.expansion);
    }

    if (product.formatSlug && product.format) {
      formatsMap.set(product.formatSlug, product.format);
    }

    if (product.language) {
      languages.add(product.language);
    }
  }

  return {
    brands: Array.from(brandsMap.values()),
    categories: Array.from(categoriesMap.values()),
    expansions: Array.from(expansionsMap.entries()).map(([slug, label]) => ({ slug, label })),
    formats: Array.from(formatsMap.entries()).map(([slug, label]) => ({ slug, label })),
    languages: Array.from(languages),
    price: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
  };
}

export function buildBreadcrumbs(
  items: Array<{ label: string; href?: string }>,
) {
  return items;
}

export function isBrandSlug(value: string): value is BrandSlug {
  return value.trim().length > 0;
}

export function getScopedCollection(options: {
  brand?: BrandSlug;
  category?: ProductCategorySlug;
  preorderOnly?: boolean;
  accessoriesOnly?: boolean;
}) {
  return products.filter((product) => {
    if (options.brand && product.brand !== options.brand) {
      return false;
    }

    if (options.category && product.category !== options.category) {
      return false;
    }

    if (options.preorderOnly && !product.isPreorder) {
      return false;
    }

    if (options.accessoriesOnly && product.brand !== "accesorios") {
      return false;
    }

    return true;
  });
}

export function getCollectionMeta(options: {
  title: string;
  description: string;
  brand?: Brand;
}) {
  return {
    title: options.title,
    description: options.description,
    theme: options.brand?.theme ?? {
      from: "from-primary/25",
      via: "via-white/5",
      to: "to-accent/20",
      glow: "shadow-glow",
    },
  };
}
