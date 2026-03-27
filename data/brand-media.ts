import type { BrandSlug } from "@/types/store";

export type BrandMedia = {
  src?: string;
  alt: string;
  gallery?: string[];
  logo?: string;
};

export const brandMedia: Record<BrandSlug, BrandMedia> = {
  pokemon: {
    alt: "Artwork representativo de Pokemon TCG",
    logo: "/brands/pokemon/pokemon-logo.webp",
    gallery: [
      "/brands/pokemon/pokemon1.webp",
      "/brands/pokemon/pokemon2.webp",
      "/brands/pokemon/pokemon3.webp",
    ],
  },
  "one-piece": {
    alt: "Artwork representativo de One Piece TCG",
    logo: "/brands/one-piece/onepiece-logo.webp",
    gallery: [
      "/brands/one-piece/onepiece1.webp",
      "/brands/one-piece/oncepiece2.webp",
      "/brands/one-piece/onepiece3.webp",
    ],
  },
  riftbound: {
    alt: "Artwork representativo de Riftbound",
    logo: "/brands/riftbound/riftbound-logo.webp",
    gallery: [
      "/brands/riftbound/riftbound1.webp",
      "/brands/riftbound/riftbound2.webp",
      "/brands/riftbound/riftbound3.webp",
    ],
  },
  magic: {
    alt: "Artwork representativo de Magic: The Gathering",
    logo: "/brands/magic/magic-logo.webp",
    gallery: [
      "/brands/magic/magic1.webp",
      "/brands/magic/magic2.webp",
      "/brands/magic/magic3.webp",
    ],
  },
  accesorios: {
    src: "/brands/accesorios/hero.webp",
    alt: "Artwork representativo de accesorios TCG",
  },
  preventa: {
    src: "/brands/preventa/hero.webp",
    alt: "Artwork representativo de preventa TCG",
  },
};
