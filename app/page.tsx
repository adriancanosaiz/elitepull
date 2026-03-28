import { homeHeroBanner } from "@/data/banners";
import { brands } from "@/data/brands";
import { BenefitStrip } from "@/components/store/benefit-strip";
import { BrandCard } from "@/components/store/brand-card";
import { HeroBanner } from "@/components/store/hero-banner";
import { SectionHeading } from "@/components/store/section-heading";
import { StoreReveal } from "@/components/store/store-reveal";
import { StoreViewportMount } from "@/components/store/store-viewport-mount";
import { buildPageMetadata } from "@/lib/site-config";

const primaryBrands = brands.filter((brand) => !["accesorios", "preventa"].includes(brand.slug));
const supportBrands = brands.filter((brand) => ["accesorios", "preventa"].includes(brand.slug));

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
      <HeroBanner banner={homeHeroBanner} />

      <section className="app-container scroll-defer py-10 md:py-12">
        <StoreReveal>
          <SectionHeading
            eyebrow="Universos TCG"
            title="Universos con identidad propia, reunidos en una sola entrada"
            description="Cada marca entra como un mundo distinto dentro de ElitePull: sellado, singles y producto de colección presentados con una lectura clara, visual y muy centrada en el coleccionista."
          />
        </StoreReveal>

        <div className="mt-8 space-y-6">
          {primaryBrands.map((brand, index) => (
            <StoreViewportMount
              key={brand.id}
              from={index % 2 === 0 ? "left" : "right"}
              placeholderClassName="min-h-[540px] sm:min-h-[580px] lg:min-h-[520px]"
            >
              <BrandCard
                brand={brand}
                imageSide={index % 2 === 0 ? "left" : "right"}
              />
            </StoreViewportMount>
          ))}
        </div>

        <div className="mt-10">
          <StoreReveal>
            <SectionHeading
              eyebrow="Complementos"
              title="Accesorios y preventa para cerrar bien cada compra"
              description="Protección, archivo y próximos lanzamientos con una navegación rápida, limpia y pensada para seguir ampliando colección."
            />
          </StoreReveal>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
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
