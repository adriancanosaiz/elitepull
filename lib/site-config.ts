import type { Metadata } from "next";

const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "ElitePull",
  title: "ElitePull | Tienda Especializada TCG: Pokémon, One Piece y Magic",
  description:
    "Compra cartas coleccionables, cajas selladas y singles de Pokémon TCG, One Piece, Lorcana y Magic. Envíos rápidos, protección premium y stock garantizado en ElitePull.",
  locale: "es_ES",
  contactEmail: "hola@elitepull.com",
  defaultKeywords: [
    "tienda tcg",
    "comprar cartas pokemon",
    "pokemon tcg españa",
    "one piece tcg españa",
    "comprar cartas magic",
    "cartas coleccionables",
    "cajas pokemon",
    "singles tcg",
    "comprar lorcana españa",
  ],
} as const;

export function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!value) {
    return DEFAULT_SITE_URL;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function buildAbsoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  return {
    title,
    description,
    keywords: keywords ?? [...siteConfig.defaultKeywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title,
      description,
      url: buildAbsoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
