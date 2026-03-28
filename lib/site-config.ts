import type { Metadata } from "next";

const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "ElitePull",
  title: "ElitePull | TCG premium para coleccionistas",
  description:
    "Tienda premium de TCG con catalogo, accesorios, checkout con Stripe y gestion operativa desde admin.",
  locale: "es_ES",
  contactEmail: "hola@elitepull.com",
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
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
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
  };
}
