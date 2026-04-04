import type { PromoBanner } from "@/types/store";

export const homeHeroBanner: PromoBanner = {
  id: "hero-home",
  title: "Tu colección llevada al siguiente nivel",
  subtitle: "Encuentra desde Elite Trainer Boxes (ETB) hasta los singles más buscados con disponibilidad inmediata.",
  description:
    "El inventario definitivo de Pokémon, One Piece y Magic. Explora nuestro catálogo oficial con stock garantizado y protección premium.",
  ctaLabel: "Explorar catalogo",
  href: "/catalogo",
  image: "/mock/banners/hero-tcg.svg",
  theme: {
    from: "from-amber-400/30",
    via: "via-sky-400/15",
    to: "to-violet-500/30",
    glow: "shadow-[0_0_60px_rgba(56,189,248,0.22)]",
  },
};

export const promoBanners: PromoBanner[] = [
  {
    id: "banner-preventa",
    title: "Preventa Prioritaria",
    subtitle: "Asegura los lanzamientos más esperados antes que nadie.",
    description:
      "Reserva cajas de expansión, decks y colecciones especiales. Stock garantizado en la fecha de salida oficial.",
    ctaLabel: "Ver preventa",
    href: "/preventa",
    image: "/mock/banners/preorder-drop.svg",
    theme: {
      from: "from-rose-500/28",
      via: "via-sky-400/15",
      to: "to-amber-400/25",
      glow: "shadow-[0_0_60px_rgba(244,63,94,0.2)]",
    },
  },
  {
    id: "banner-sealed",
    title: "Producto Sellado",
    subtitle: "Las cajas de expansión y ETBs más valoradas.",
    description:
      "Descubre material fresco perfecto para draftear, abrir por pura emoción o guardar a largo plazo en tu colección privada.",
    ctaLabel: "Ver sellado",
    href: "/catalogo",
    image: "/mock/banners/sealed-showcase.svg",
    theme: {
      from: "from-emerald-400/25",
      via: "via-cyan-400/15",
      to: "to-sky-500/25",
      glow: "shadow-[0_0_60px_rgba(16,185,129,0.18)]",
    },
  },
];
