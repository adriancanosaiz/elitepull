import type { PromoBanner } from "@/types/store";

export const homeHeroBanner: PromoBanner = {
  id: "hero-home",
  title: "Cartas, sellado y accesorios para coleccionistas exigentes",
  subtitle: "Pokemon, One Piece, Magic y Riftbound en una tienda cuidada para comprar con confianza.",
  description:
    "Explora producto seleccionado, preventas destacadas y accesorios para proteger tu colección con una experiencia de compra clara y premium.",
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
    title: "Preventa prioritaria",
    subtitle: "Reservas de próximos lanzamientos con información clara y acceso rápido.",
    description:
      "Asegura tus próximos productos antes de su salida y consulta las referencias más esperadas del calendario.",
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
    title: "Sellado protagonista",
    subtitle: "ETB, cajas y collector boosters con estética de escaparate.",
    description:
      "Descubre producto sellado con presencia de vitrina, perfecto para abrir, regalar o guardar en colección.",
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
