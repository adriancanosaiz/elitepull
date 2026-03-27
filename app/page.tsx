import { homeHeroBanner } from "@/data/banners";
import { brands } from "@/data/brands";
import { BenefitStrip } from "@/components/store/benefit-strip";
import { BrandCard } from "@/components/store/brand-card";
import { HeroBanner } from "@/components/store/hero-banner";
import { SectionHeading } from "@/components/store/section-heading";
import { getHomeData } from "@/lib/repositories/store-repository";

const primaryBrands = brands.filter((brand) => !["accesorios", "preventa"].includes(brand.slug));
const supportBrands = brands.filter((brand) => ["accesorios", "preventa"].includes(brand.slug));

export default async function HomePage() {
  const homeData = await getHomeData();

  return (
    <>
      <HeroBanner banner={homeHeroBanner} featuredProducts={homeData.heroProducts} />

      <section className="app-container py-10 md:py-12">
        <SectionHeading
          eyebrow="Universos TCG"
          title="Cuatro marcas protagonistas y un cierre claro para explorar la tienda"
          description="La Home se centra en las marcas: primero los universos principales con presencia editorial, y al final accesorios y preventa como accesos complementarios."
        />

        <div className="mt-8 space-y-6">
          {primaryBrands.map((brand, index) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              imageSide={index % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>

        <div className="mt-10">
          <SectionHeading
            eyebrow="Complementos"
            title="Accesorios y preventa al final, juntos y bien alineados"
            description="Dos entradas secundarias para completar la navegación sin competir con las marcas TCG principales."
          />

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {supportBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} compact />
            ))}
          </div>
        </div>
      </section>

      <BenefitStrip />
    </>
  );
}
