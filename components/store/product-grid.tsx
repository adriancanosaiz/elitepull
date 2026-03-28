import type { ProductCardItem } from "@/types/contracts";

import { ProductCardSealed } from "@/components/store/product-card-sealed";
import { ProductCardSingle } from "@/components/store/product-card-single";

export function ProductGrid({
  products,
}: {
  products: ProductCardItem[];
}) {
  return (
    <div className="scroll-defer-grid grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
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
