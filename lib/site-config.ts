import type { Metadata } from "next";

const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "ElitePull",
  title: "ElitePull | Tienda TCG premium",
  description:
    "Tienda online de Pokemon, One Piece, Magic, Riftbound y accesorios para coleccionistas y jugadores. Sellado, singles, preventas y proteccion premium.",
  locale: "es_ES",
  contactEmail: "hola@elitepull.com",
  defaultKeywords: [
    "tienda tcg",
    "pokemon tcg",
    "one piece tcg",
    "magic the gathering",
    "riftbound",
    "cartas coleccionables",
    "sellado tcg",
    "singles tcg",
    "accesorios tcg",
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
