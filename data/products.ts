import type { Product } from "@/types/store";

const legacyCategoryToFormatMap = {
  etb: { slug: "etb", label: "ETB" },
  sobres: { slug: "booster-packs", label: "Booster Packs" },
  "sobres-individuales": { slug: "booster-packs", label: "Booster Packs" },
  "booster-packs": { slug: "booster-packs", label: "Booster Packs" },
  "booster-normales": { slug: "booster-packs", label: "Booster Packs" },
  blister: { slug: "blister", label: "Blister" },
  "blister-3-sobres": { slug: "blister", label: "Blister" },
  cajas: { slug: "cajas", label: "Cajas" },
  "ediciones-especiales": { slug: "ediciones-especiales", label: "Ediciones especiales" },
  "booster-coleccion": {
    slug: "collector-booster-packs",
    label: "Collector Booster Packs",
  },
  "collector-booster-packs": {
    slug: "collector-booster-packs",
    label: "Collector Booster Packs",
  },
  "commander-decks": { slug: "commander-decks", label: "Commander Decks" },
  bundle: { slug: "bundle", label: "Bundle" },
  "cartas-individuales": { slug: "cartas-individuales", label: "Cartas individuales" },
  fundas: { slug: "fundas", label: "Fundas" },
  "deck-boxes": { slug: "deck-boxes", label: "Deck Boxes" },
  binders: { slug: "binders", label: "Binders" },
  toploaders: { slug: "toploaders", label: "Toploaders" },
  "dados-tapetes": { slug: "dados-tapetes", label: "Dados y tapetes" },
} as const satisfies Record<string, { slug: string; label: string }>;

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeMockProduct(product: Product): Product {
  const mappedFormat =
    legacyCategoryToFormatMap[product.category as keyof typeof legacyCategoryToFormatMap];
  const formatSlug = product.formatSlug ?? mappedFormat?.slug ?? product.category;
  const formatLabel =
    product.format ?? mappedFormat?.label ?? product.categoryLabel ?? humanizeSlug(formatSlug);

  return {
    ...product,
    category: formatSlug,
    categoryLabel: formatLabel,
    formatSlug,
    format: formatLabel,
  };
}

const rawProducts: Product[] = [
  {
    id: "prod_pokemon_prismatic_etb",
    slug: "pokemon-prismatic-evolutions-etb",
    type: "sealed",
    name: "Pokemon Prismatic Evolutions Elite Trainer Box",
    brand: "pokemon",
    category: "etb",
    description:
      "ETB visualmente protagonista con gran presencia en vitrina y excelente punto de entrada para coleccionismo premium.",
    price: 79.9,
    compareAtPrice: 89.9,
    stock: 12,
    featured: true,
    isPreorder: false,
    expansion: "Prismatic Evolutions",
    image: "/mock/products/pokemon-etb.svg",
    images: [
      "/mock/products/pokemon-etb.svg",
      "/mock/products/pokemon-etb-alt.svg",
    ],
    tags: ["nuevo", "sellado", "premium"],
  },
  {
    id: "prod_pokemon_surging_sparks_pack",
    slug: "pokemon-surging-sparks-booster-pack",
    type: "sealed",
    name: "Pokemon Surging Sparks Booster Pack",
    brand: "pokemon",
    category: "booster-packs",
    description:
      "Booster de rotación alta con identidad vibrante para aperturas rápidas y reposición constante.",
    price: 6.25,
    stock: 48,
    featured: true,
    isPreorder: false,
    expansion: "Surging Sparks",
    image: "/mock/products/pokemon-booster.svg",
    images: ["/mock/products/pokemon-booster.svg"],
    tags: ["booster", "popular"],
  },
  {
    id: "prod_pokemon_151_blister",
    slug: "pokemon-151-blister-3-sobres",
    type: "sealed",
    name: "Pokemon 151 Blister 3 Sobres",
    brand: "pokemon",
    category: "blister-3-sobres",
    description:
      "Formato regalo y coleccionismo casual con gran lectura de valor desde la primera mirada.",
    price: 18.9,
    compareAtPrice: 21.9,
    stock: 18,
    featured: false,
    isPreorder: false,
    expansion: "Scarlet & Violet 151",
    image: "/mock/products/pokemon-blister.svg",
    images: ["/mock/products/pokemon-blister.svg"],
    tags: ["151", "promo"],
  },
  {
    id: "prod_one_piece_op09_box",
    slug: "one-piece-op09-four-emperors-booster-box",
    type: "sealed",
    name: "One Piece OP-09 Four Emperors Booster Box",
    brand: "one-piece",
    category: "cajas",
    description:
      "Caja sellada con peso visual alto, ideal para aperturas de contenido y venta premium.",
    price: 124.9,
    compareAtPrice: 139.9,
    stock: 8,
    featured: true,
    isPreorder: false,
    expansion: "OP-09 Four Emperors",
    image: "/mock/products/one-piece-box.svg",
    images: [
      "/mock/products/one-piece-box.svg",
      "/mock/products/one-piece-box-alt.svg",
    ],
    tags: ["anime", "sellado", "top"],
  },
  {
    id: "prod_one_piece_op10_preorder",
    slug: "one-piece-op10-royal-blood-booster-box-preventa",
    type: "sealed",
    name: "One Piece OP-10 Royal Blood Booster Box",
    brand: "one-piece",
    category: "cajas",
    description:
      "Preventa con gran tracción para campañas hero y comunicación de disponibilidad futura.",
    price: 119.9,
    stock: 0,
    featured: true,
    isPreorder: true,
    expansion: "OP-10 Royal Blood",
    badge: "Preventa",
    image: "/mock/products/one-piece-preorder.svg",
    images: ["/mock/products/one-piece-preorder.svg"],
    tags: ["preventa", "reserva"],
  },
  {
    id: "prod_riftbound_founders_box",
    slug: "riftbound-founders-booster-box-preventa",
    type: "sealed",
    name: "Riftbound Founders Booster Box",
    brand: "riftbound",
    category: "cajas",
    description:
      "Caja de lanzamiento con estética high fantasy y foco claro en early adopters.",
    price: 109.9,
    stock: 0,
    featured: true,
    isPreorder: true,
    expansion: "Founders Set",
    badge: "Launch Drop",
    image: "/mock/products/riftbound-box.svg",
    images: ["/mock/products/riftbound-box.svg"],
    tags: ["nuevo", "preventa", "launch"],
  },
  {
    id: "prod_riftbound_ignite_commander",
    slug: "riftbound-ignite-commander-deck",
    type: "sealed",
    name: "Riftbound Ignite Commander Deck",
    brand: "riftbound",
    category: "commander-decks",
    description:
      "Commander deck listo para jugar, ideal para destacar valor y entrada directa al sistema.",
    price: 44.9,
    stock: 15,
    featured: false,
    isPreorder: false,
    expansion: "Ignite",
    image: "/mock/products/riftbound-deck.svg",
    images: ["/mock/products/riftbound-deck.svg"],
    tags: ["deck", "starter"],
  },
  {
    id: "prod_magic_foundations_play",
    slug: "magic-foundations-play-booster",
    type: "sealed",
    name: "Magic Foundations Play Booster",
    brand: "magic",
    category: "booster-normales",
    description:
      "Play booster evergreen con presentación limpia y rotación sólida para público recurrente.",
    price: 5.9,
    stock: 64,
    featured: true,
    isPreorder: false,
    expansion: "Foundations",
    image: "/mock/products/magic-play-booster.svg",
    images: ["/mock/products/magic-play-booster.svg"],
    tags: ["booster", "draft"],
  },
  {
    id: "prod_magic_mh3_collector",
    slug: "magic-modern-horizons-3-collector-booster",
    type: "sealed",
    name: "Magic Modern Horizons 3 Collector Booster",
    brand: "magic",
    category: "booster-coleccion",
    description:
      "Producto de ticket premium con lectura instantánea de valor para el cliente experto.",
    price: 39.9,
    compareAtPrice: 44.9,
    stock: 20,
    featured: true,
    isPreorder: false,
    expansion: "Modern Horizons 3",
    image: "/mock/products/magic-collector.svg",
    images: [
      "/mock/products/magic-collector.svg",
      "/mock/products/magic-collector-alt.svg",
    ],
    tags: ["collector", "premium"],
  },
  {
    id: "prod_accessories_sleeves",
    slug: "dragon-shield-matte-nebula-sleeves",
    type: "accessory",
    name: "Dragon Shield Matte Nebula Sleeves",
    brand: "accesorios",
    category: "fundas",
    description:
      "Fundas premium con acabado mate y presencia elegante para completar el ticket medio.",
    price: 12.9,
    stock: 42,
    featured: true,
    isPreorder: false,
    image: "/mock/products/accessory-sleeves.svg",
    images: ["/mock/products/accessory-sleeves.svg"],
    tags: ["proteccion", "premium"],
  },
  {
    id: "prod_accessories_boulder",
    slug: "ultimate-guard-boulder-deck-box",
    type: "accessory",
    name: "Ultimate Guard Boulder Deck Box",
    brand: "accesorios",
    category: "deck-boxes",
    description:
      "Deck box robusta con look limpio y tacto premium para usuarios exigentes.",
    price: 14.9,
    stock: 26,
    featured: false,
    isPreorder: false,
    image: "/mock/products/accessory-box.svg",
    images: ["/mock/products/accessory-box.svg"],
    tags: ["storage", "deck-box"],
  },
  {
    id: "prod_single_charizard",
    slug: "charizard-ex-special-illustration-rare",
    type: "single",
    name: "Charizard ex Special Illustration Rare",
    brand: "pokemon",
    category: "cartas-individuales",
    description:
      "Carta chase con presencia hero, pensada para módulos premium de singles destacados.",
    price: 219.9,
    stock: 1,
    featured: true,
    isPreorder: false,
    expansion: "Paldean Fates",
    language: "EN",
    rarity: "SIR",
    condition: "NM",
    badge: "Hot Pull",
    image: "/mock/products/single-charizard.svg",
    images: [
      "/mock/products/single-charizard.svg",
      "/mock/products/single-charizard-back.svg",
    ],
    tags: ["single", "chase", "graded-look"],
  },
  {
    id: "prod_single_luffy",
    slug: "monkey-d-luffy-alt-art-leader",
    type: "single",
    name: "Monkey D. Luffy Alt Art Leader",
    brand: "one-piece",
    category: "cartas-individuales",
    description:
      "Single de fuerte identidad anime para bloques curados y ventas de aspiración.",
    price: 174.9,
    stock: 1,
    featured: true,
    isPreorder: false,
    expansion: "Awakening of the New Era",
    language: "JP",
    rarity: "Alt Art",
    condition: "NM",
    badge: "Collector Pick",
    image: "/mock/products/single-luffy.svg",
    images: ["/mock/products/single-luffy.svg"],
    tags: ["single", "anime", "alt-art"],
  },
  {
    id: "prod_single_sheoldred",
    slug: "sheoldred-the-apocalypse-showcase",
    type: "single",
    name: "Sheoldred, the Apocalypse Showcase",
    brand: "magic",
    category: "cartas-individuales",
    description:
      "Carta premium con gran presencia editorial para atraer a comprador experto desde la portada.",
    price: 89.9,
    stock: 2,
    featured: false,
    isPreorder: false,
    expansion: "Dominaria United",
    language: "EN",
    rarity: "Mythic Rare",
    condition: "EX",
    image: "/mock/products/single-sheoldred.svg",
    images: ["/mock/products/single-sheoldred.svg"],
    tags: ["single", "mythic"],
  },
];

export const products: Product[] = rawProducts.map(normalizeMockProduct);

const curatedIds = {
  novedades: [
    "prod_pokemon_prismatic_etb",
    "prod_one_piece_op09_box",
    "prod_magic_mh3_collector",
    "prod_accessories_sleeves",
  ],
  preventa: [
    "prod_one_piece_op10_preorder",
    "prod_riftbound_founders_box",
  ],
  singles: ["prod_single_charizard", "prod_single_luffy", "prod_single_sheoldred"],
  sellado: [
    "prod_pokemon_prismatic_etb",
    "prod_one_piece_op09_box",
    "prod_magic_mh3_collector",
    "prod_riftbound_ignite_commander",
  ],
  accesorios: ["prod_accessories_sleeves", "prod_accessories_boulder"],
} as const;

const selectProducts = (ids: readonly string[]) =>
  ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

export const newArrivals = selectProducts(curatedIds.novedades);
export const preorderProducts = selectProducts(curatedIds.preventa);
export const featuredSingles = selectProducts(curatedIds.singles);
export const featuredSealed = selectProducts(curatedIds.sellado);
export const featuredAccessories = selectProducts(curatedIds.accesorios);
export const featuredProducts = products.filter((product) => product.featured);

export const filterOptions = {
  brands: ["pokemon", "one-piece", "riftbound", "magic", "accesorios"],
  categories: [
    "sobres",
    "etb",
    "blister-3-sobres",
    "booster-packs",
    "sobres-individuales",
    "cajas",
    "ediciones-especiales",
    "commander-decks",
    "booster-normales",
    "booster-coleccion",
    "fundas",
    "deck-boxes",
    "binders",
    "toploaders",
    "dados-tapetes",
  ],
  expansions: [
    "Prismatic Evolutions",
    "Scarlet & Violet 151",
    "OP-09 Four Emperors",
    "OP-10 Royal Blood",
    "Founders Set",
    "Ignite",
    "Foundations",
    "Modern Horizons 3",
    "Paldean Fates",
  ],
  languages: ["ES", "EN", "JP"],
} as const;
