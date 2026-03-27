import type { PromoBanner } from "@/types/store";

export const homeHeroBanner: PromoBanner = {
  id: "hero-home",
  title: "Coleccionismo premium para TCG y cultura anime",
  subtitle: "Sellado, singles y accesorios con una puesta en escena de tienda seria y aspiracional.",
  description:
    "Una base visual lista para destacar novedades, preventas y producto curado sin depender todavía de backend.",
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
    subtitle: "Reservas con presencia editorial y CTA claros.",
    description:
      "Diseñado para campañas de lanzamiento con sensación de acceso anticipado y ticket premium.",
    ctaLabel: "Ver preventa",
    href: "/preventa",
    image: "/mock/banners/preorder-drop.svg",
    theme: {
      from: "from-fuchsia-500/30",
      via: "via-sky-400/15",
      to: "to-amber-400/25",
      glow: "shadow-[0_0_60px_rgba(217,70,239,0.22)]",
    },
  },
  {
    id: "banner-sealed",
    title: "Sellado protagonista",
    subtitle: "ETB, cajas y collector boosters con estética de escaparate.",
    description:
      "Pensado para módulos de producto hero, colecciones destacadas y campañas por marca.",
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
