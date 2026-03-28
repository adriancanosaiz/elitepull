import type { Benefit, FooterLinkGroup, NavLinkItem } from "@/types/store";
import { buildCollectionQueryString } from "@/lib/routes/query-params";

export const mainNavigation: NavLinkItem[] = [
  {
    label: "Catalogo",
    href: "/catalogo",
    description: "Vista global con marcas, filtros y colecciones destacadas.",
  },
  {
    label: "Accesorios",
    href: "/accesorios",
    description: "Fundas, deck boxes y archivo premium.",
  },
  {
    label: "Preventa",
    href: "/preventa",
    description: "Lanzamientos futuros listos para reserva.",
  },
];

export const headerQuickLinks: NavLinkItem[] = [
  { label: "Pokemon", href: "/marca/pokemon" },
  { label: "One Piece", href: "/marca/one-piece" },
  { label: "Riftbound", href: "/marca/riftbound" },
  { label: "Magic", href: "/marca/magic" },
];

export const benefits: Benefit[] = [
  {
    id: "shipping",
    title: "Envio rapido",
    description: "Preparado para destacar plazos y confianza desde el primer scroll.",
  },
  {
    id: "stock",
    title: "Stock real",
    description: "La interfaz ya contempla mensajes claros de disponibilidad y reserva.",
  },
  {
    id: "secure",
    title: "Pago seguro",
    description: "Bloques visuales listos para integrar checkout cuando llegue el backend.",
  },
  {
    id: "support",
    title: "Atencion especializada",
    description: "Tono y estructura pensados para coleccionistas exigentes.",
  },
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: "Comprar",
    links: [
      { label: "Catalogo", href: "/catalogo" },
      { label: "Pokemon", href: "/marca/pokemon" },
      { label: "One Piece", href: "/marca/one-piece" },
      { label: "Magic", href: "/marca/magic" },
    ],
  },
  {
    title: "Explorar",
    links: [
      { label: "Accesorios", href: "/accesorios" },
      { label: "Preventa", href: "/preventa" },
      {
        label: "Singles",
        href: `/catalogo?${buildCollectionQueryString({ category: ["cartas-individuales"] })}`,
      },
      {
        label: "Destacados premium",
        href: `/catalogo?${buildCollectionQueryString({ featured: true })}`,
      },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Envios y devoluciones", href: "/envios-devoluciones" },
      { label: "Privacidad", href: "/politica-privacidad" },
      { label: "Condiciones", href: "/terminos" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
];

export const searchSuggestions = [
  "Charizard ex",
  "Collector Booster",
  "ETB Pokemon",
  "Riftbound",
  "Fundas premium",
];
