export function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSlugList(values: string[]) {
  return values.map((value) => normalizeSlug(value)).filter(Boolean);
}

export function normalizeOptionalSlug(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const normalized = normalizeSlug(value);

  return normalized || undefined;
}
