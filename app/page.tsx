import dynamic from "next/dynamic";

import { homeHeroBanner } from "@/data/banners";
import { brands } from "@/data/brands";
import { BrandCard } from "@/components/store/brand-card";
import { HeroBanner } from "@/components/store/hero-banner";
import { SectionHeading } from "@/components/store/section-heading";
import { StoreReveal } from "@/components/store/store-reveal";
import { StoreViewportMount } from "@/components/store/store-viewport-mount";
import { buildPageMetadata } from "@/lib/site-config";

const primaryBrands = brands.filter((brand) => !["accesorios", "preventa"].includes(brand.slug));
const supportBrands = brands.filter((brand) => ["accesorios", "preventa"].includes(brand.slug));
const BenefitStrip = dynamic(
  () => import("@/components/store/benefit-strip").then((module) => module.BenefitStrip),
  {
    loading: () => null,
  },
);

export const metadata = buildPageMetadata({
  title: "Tienda TCG premium",
  description:
    "Compra Pokemon, One Piece, Magic, Riftbound y accesorios con seleccion cuidada, stock real y una experiencia de compra premium.",
  path: "/",
  keywords: [
    "tienda tcg",
    "pokemon tcg",
    "one piece tcg",
    "magic the gathering",
    "riftbound",
    "cartas coleccionables",
    "accesorios tcg",
  ],
});

export default async function HomePage() {
  return (
    <>
      {/* Hero: full screen on mobile */}
      <HeroBanner banner={homeHeroBanner} />

      {/* Brands section: snap per brand on mobile */}
      <section className="app-container scroll-defer py-6 md:py-12">
        <StoreReveal>
          <SectionHeading
            eyebrow="Catálogo Oficial"
            title="Explora nuestras franquicias TCG"
            description="Seleccionamos meticulosamente material sellado y cartas sueltas para que encuentres exactamente lo que tu baraja o vitrina necesita."
          />
        </StoreReveal>

        <div className="mt-5 space-y-0 md:mt-8 md:space-y-6">
          {primaryBrands.map((brand, index) => (
            <StoreViewportMount
              key={brand.id}
              from={index % 2 === 0 ? "left" : "right"}
              placeholderClassName="min-h-[100svh] sm:min-h-[540px] lg:min-h-[520px]"
            >
              {/* Each brand card fills screen on mobile */}
              <div className="flex min-h-[calc(100svh-56px)] items-center py-4 sm:min-h-0 sm:py-0">
                <BrandCard
                  brand={brand}
                  imageSide={index % 2 === 0 ? "left" : "right"}
                />
              </div>
            </StoreViewportMount>
          ))}
        </div>

        <div className="mt-6 md:mt-10">
          <StoreReveal>
            <SectionHeading
              eyebrow="Complementos Premium"
              title="Accesorios y preventas seguras"
              description="Asegura la protección archivística de tus grails más valiosos o reserva las colecciones del próximo trimestre antes de que se agoten."
            />
          </StoreReveal>

          <div className="mt-5 grid gap-4 md:mt-6 md:gap-5 lg:grid-cols-2">
            {supportBrands.map((brand) => (
              <StoreViewportMount
                key={brand.id}
                from="up"
                placeholderClassName="min-h-[420px]"
              >
                <BrandCard brand={brand} compact />
              </StoreViewportMount>
            ))}
          </div>
        </div>
      </section>

      <BenefitStrip />
    </>
  );
}
