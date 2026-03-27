import type { ProductCardItem } from "@/types/contracts";

import { ProductCardSealed } from "@/components/store/product-card-sealed";
import { ProductCardSingle } from "@/components/store/product-card-single";

export function ProductGrid({
  products,
}: {
  products: ProductCardItem[];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) =>
        product.type === "single" ? (
          <ProductCardSingle key={product.id} product={product} />
        ) : (
          <ProductCardSealed key={product.id} product={product} />
        ),
      )}
    </div>
  );
}
