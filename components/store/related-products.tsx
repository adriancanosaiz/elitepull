import type { CollectionItem } from "@/types/contracts";

import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";

export function RelatedProducts({ products }: { products: CollectionItem[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="app-container py-10">
      <SectionHeading
        eyebrow="Relacionados"
        title="Piezas que encajan con esta compra"
        description="Producto complementario y alternativas cercanas para elevar ticket y exploracion."
      />
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
