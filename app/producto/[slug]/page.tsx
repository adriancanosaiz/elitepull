import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductInfo } from "@/components/store/product-info";
import { RelatedProducts } from "@/components/store/related-products";
import { StoreReveal } from "@/components/store/store-reveal";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/repositories/store-repository";
import { formatPrice } from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/site-config";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return buildPageMetadata({
    title: `${product.name} - ${product.brand.label}`,
    description: product.description,
    path: `/producto/${product.slug}`,
    keywords: [product.name, product.brand.label, product.category.label, product.expansion].filter(
      (value): value is string => Boolean(value),
    ),
  });
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
      <section className="app-container pb-8 pt-6 md:pt-10">
        <div className="surface-panel overflow-hidden px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
          <div className="collector-constellation pointer-events-none absolute inset-0 opacity-35" />
          <div className="kinetic-lines pointer-events-none absolute inset-0 opacity-[0.06]" />
          <div className="pointer-events-none absolute left-[8%] top-0 h-28 w-48 rounded-full bg-amber-300/12 blur-3xl" />
          <div className="pointer-events-none absolute right-[10%] top-[8%] h-24 w-48 rounded-full bg-cyan-300/12 blur-3xl" />

          <div className="relative">
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

            <StoreReveal className="mt-5 grid gap-5 xl:mt-6 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
              <ProductGallery
                images={product.images}
                imageAlts={product.imageAlts}
                name={product.name}
                fallbackSrc={getProductFallbackImage(product.type)}
              />
              <div className="xl:sticky xl:top-28 xl:self-start">
                <ProductInfo product={product} />
              </div>
            </StoreReveal>
          </div>
        </div>

        <div className="scroll-defer mt-6 grid gap-5 sm:mt-8 lg:grid-cols-2 lg:gap-6">
          <StoreReveal>
            <div className="surface-card p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Ficha rapida
              </p>
              <h2 className="mt-3 font-heading text-xl font-semibold text-white">
                Detalles del producto
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 text-sm leading-7 text-slate-300">
                <p>
                  Marca: <span className="text-white">{product.brand.label}</span>
                </p>
                <p>
                  Expansion: <span className="text-white">{product.expansion ?? "General"}</span>
                </p>
                <p>
                  Formato: <span className="text-white">{product.format ?? product.category.label}</span>
                </p>
                <p>
                  Idioma: <span className="text-white">{product.language ?? "ES"}</span>
                </p>
                {product.variant ? (
                  <p>
                    Variante: <span className="text-white">{product.variant}</span>
                  </p>
                ) : null}
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
          </StoreReveal>

          <StoreReveal delay={0.08}>
            <div className="hidden surface-card p-6 sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Compra segura
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
                Compra clara, rápida y preparada para coleccionista
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Revisa precio, disponibilidad y estructura del producto antes de añadirlo al
                carrito. El checkout se completa en un flujo seguro con confirmación por email y
                una presentación pensada para que todo se entienda de un vistazo.
              </p>
            </div>
          </StoreReveal>
        </div>
      </section>

      <RelatedProducts products={relatedProducts} />
    </>
  );
}
