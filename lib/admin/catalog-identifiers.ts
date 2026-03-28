import { normalizeSlug } from "@/lib/routes/slugs";
import type { ProductLanguage } from "@/types/store";

function compactSlug(value?: string | null) {
  const normalized = normalizeSlug(value ?? "");
  return normalized || "general";
}

function toSkuToken(value?: string | null, maxLength = 6) {
  const normalized = compactSlug(value).replace(/-/g, "").toUpperCase();
  return normalized.slice(0, maxLength) || "GEN";
}

function hashText(value: string) {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }

  return Math.abs(hash >>> 0).toString(36).toUpperCase().slice(0, 5);
}

export function buildCatalogSlugFromLabel(label: string) {
  return normalizeSlug(label) || "item";
}

export function buildGeneratedProductSlug(input: {
  brandSlug: string;
  expansionSlug: string;
  formatSlug: string;
  languageCode: ProductLanguage;
  variantLabel?: string | null;
  name: string;
}) {
  return [
    compactSlug(input.brandSlug),
    compactSlug(input.expansionSlug),
    compactSlug(input.formatSlug),
    input.languageCode.toLowerCase(),
    input.variantLabel ? compactSlug(input.variantLabel) : null,
    compactSlug(input.name),
  ]
    .filter(Boolean)
    .join("-");
}

export function buildGeneratedProductSku(input: {
  brandSlug: string;
  expansionSlug: string;
  formatSlug: string;
  languageCode: ProductLanguage;
  variantLabel?: string | null;
  name: string;
}) {
  const signature = [
    compactSlug(input.brandSlug),
    compactSlug(input.expansionSlug),
    compactSlug(input.formatSlug),
    input.languageCode,
    compactSlug(input.variantLabel),
    compactSlug(input.name),
  ].join("|");

  return [
    toSkuToken(input.brandSlug, 4),
    toSkuToken(input.expansionSlug, 6),
    toSkuToken(input.formatSlug, 5),
    input.languageCode.toUpperCase(),
    input.variantLabel ? toSkuToken(input.variantLabel, 5) : null,
    hashText(signature),
  ]
    .filter(Boolean)
    .join("-");
}
