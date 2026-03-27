import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductInfo } from "@/components/store/product-info";
import { RelatedProducts } from "@/components/store/related-products";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/repositories/store-repository";
import { formatPrice } from "@/lib/catalog";

function getProductFallbackImage(productType: "sealed" | "single" | "accessory") {
  switch (productType) {
    case "single":
      return "/mock/products/single-charizard.svg";
    case "accessory":
      return "/mock/products/accessory-box.svg";
    default:
      return "/mock/products/pokemon-etb.svg";
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id);

  return (
    <>
      <section className="app-container pb-8 pt-8 md:pt-10">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: product.brand.label, href: product.brand.href },
            ...(product.category.href
              ? [{ label: product.category.label, href: product.category.href }]
              : []),
            { label: product.name },
          ]}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery
            images={product.images}
            name={product.name}
            fallbackSrc={getProductFallbackImage(product.type)}
          />
          <ProductInfo product={product} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="surface-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Informacion adicional
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
              Contexto de compra y lectura rapida de valor
            </h2>
            <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-300">
              <p>
                Categoria: <span className="text-white">{product.category.label}</span>
              </p>
              <p>
                Precio actual: <span className="text-white">{formatPrice(product.price)}</span>
              </p>
              <p>
                Stock: <span className="text-white">{product.stock}</span>
              </p>
              <p>
                Preventa: <span className="text-white">{product.isPreorder ? "Si" : "No"}</span>
              </p>
            </div>
          </div>

          <div className="surface-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Compra premium
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
              Preparado para backend sin cambiar la experiencia
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              La estructura visual y de datos ya contempla stock, comparativa de precio,
              disponibilidad, CTA de carrito y modulos relacionados. En una siguiente fase
              solo tocariamos integracion real, no la arquitectura visual.
            </p>
          </div>
        </div>
      </section>

      <RelatedProducts products={relatedProducts} />
    </>
  );
}
