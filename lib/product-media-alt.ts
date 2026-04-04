export function buildAutomaticProductImageAlt(productName: string, sortOrder = 1) {
  const normalizedName = productName.trim() || "Producto";
  return `${normalizedName} imagen ${sortOrder}`;
}
