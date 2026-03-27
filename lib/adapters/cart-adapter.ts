import { brandsBySlug } from "@/data/brands";
import { products } from "@/data/products";
import type { CartItem, CartSummary } from "@/types/contracts";
import type { StoredCartItem } from "@/types/store";

export const CART_SHIPPING_THRESHOLD = 120;
export const CART_SHIPPING_COST = 6.9;

export function adaptStoredCartItems(items: StoredCartItem[]): CartItem[] {
  return items.flatMap((item) => {
      const product = products.find((entry) => entry.id === item.productId);

      if (!product) {
        return [];
      }

      return [{
        productId: item.productId,
        slug: product.slug,
        href: `/producto/${product.slug}`,
        name: product.name,
        description: product.description,
        image: product.image,
        brandLabel: brandsBySlug[product.brand].shortName,
        ...(product.expansion ? { expansion: product.expansion } : {}),
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
        stock: product.stock,
        isPreorder: product.isPreorder,
      } satisfies CartItem];
    });
}

export function buildCartSummary(items: CartItem[]): CartSummary {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.lineTotal, 0);
  const shipping =
    items.length > 0 && subtotal < CART_SHIPPING_THRESHOLD ? CART_SHIPPING_COST : 0;

  return {
    itemCount,
    subtotal,
    shipping,
    total: subtotal + shipping,
    isEmpty: items.length === 0,
  };
}
