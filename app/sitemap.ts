import type { MetadataRoute } from "next";

import { brands } from "@/data/brands";
import { buildAbsoluteUrl } from "@/lib/site-config";

const staticRoutes = [
  "/",
  "/catalogo",
  "/preventa",
  "/accesorios",
  "/contacto",
  "/politica-privacidad",
  "/terminos",
  "/envios-devoluciones",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const brandRoutes = brands.flatMap((brand) => [
    brand.href,
    ...brand.categories.map((category) => category.href),
  ]);
  const uniqueRoutes = [...new Set([...staticRoutes, ...brandRoutes])];

  return uniqueRoutes.map((route) => ({
    url: buildAbsoluteUrl(route),
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "daily",
    priority: route === "/" ? 1 : route === "/catalogo" ? 0.9 : 0.7,
  }));
}
