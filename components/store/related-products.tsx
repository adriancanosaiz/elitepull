import type { CollectionItem } from "@/types/contracts";

import { ProductGrid } from "@/components/store/product-grid";
import { SectionHeading } from "@/components/store/section-heading";
import { StoreReveal } from "@/components/store/store-reveal";

export function RelatedProducts({ products }: { products: CollectionItem[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="app-container scroll-defer py-10">
      <StoreReveal>
        <SectionHeading
          eyebrow="Relacionados"
          title="Piezas que encajan con esta compra"
          description="Producto complementario y alternativas cercanas para elevar ticket y exploracion."
        />
      </StoreReveal>
      <StoreReveal className="mt-8" delay={0.05}>
        <ProductGrid products={products} />
      </StoreReveal>
    </section>
  );
}
