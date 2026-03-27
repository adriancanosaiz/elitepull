import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brands } from "@/data/brands";
import { brandMedia } from "@/data/brand-media";
import { brandPalettes } from "@/data/brand-palettes";
import { cn } from "@/lib/utils";
import type { ProductCardItem } from "@/types/contracts";
import type { PromoBanner } from "@/types/store";

const heroBrands = brands.filter((brand) => !["accesorios", "preventa"].includes(brand.slug));

const heroCardOffsets = [
  "left-[4%] top-[18%] z-[1] w-[30%] rotate-[-12deg] sm:left-[3%] sm:top-[16%] sm:w-[29%] xl:w-[28%]",
  "left-[20%] top-[4%] z-[3] w-[36%] rotate-[-5deg] sm:left-[22%] sm:top-[1%] sm:w-[34%]",
  "right-[20%] top-[4%] z-[3] w-[36%] rotate-[5deg] sm:right-[22%] sm:top-[1%] sm:w-[34%]",
  "right-[4%] top-[18%] z-[1] w-[30%] rotate-[12deg] sm:right-[3%] sm:top-[16%] sm:w-[29%] xl:w-[28%]",
] as const;

export function HeroBanner({
  banner,
  featuredProducts,
}: {
  banner: PromoBanner;
  featuredProducts: ProductCardItem[];
}) {
  const heroCards = heroBrands
    .map((brand) => {
      const media = brandMedia[brand.slug];
      const src = media.gallery?.at(-1) ?? media.gallery?.[0] ?? media.src;

      if (!src) {
        return null;
      }

      return {
        slug: brand.slug,
        brand: brand.name,
        src,
        logo: media.logo,
        alt: `Carta destacada de ${brand.name}`,
      };
    })
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
    .slice(0, 4);
  const heroLogos = heroCards.filter((card): card is typeof heroCards[number] & { logo: string } =>
    Boolean(card.logo),
  );
  const marqueeLogos = [...heroLogos, ...heroLogos];

  return (
    <section className="app-container pb-8 pt-8 md:pb-12 md:pt-10">
      <div className="surface-panel vault-sheen relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-70",
            banner.theme.from,
            banner.theme.via,
            banner.theme.to,
          )}
        />
        <div className="vault-grid absolute inset-0 opacity-[0.07]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.18),transparent_22%),radial-gradient(circle_at_82%_16%,rgba(124,231,227,0.18),transparent_22%),linear-gradient(115deg,transparent_18%,rgba(255,255,255,0.05)_50%,transparent_82%)]" />

        <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch xl:min-h-[540px]">
          <div className="flex max-w-xl flex-col gap-8 lg:h-full lg:max-w-2xl lg:justify-between">
            <div>
              <h1 className="max-w-[11ch] font-heading text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
                {banner.title}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-100/88 sm:text-base sm:leading-8">
                {banner.subtitle}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200/78">
                {banner.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-primary/18 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/90">
                  {heroBrands.length} marcas principales
                </span>
                <span className="rounded-full border border-accent/18 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                  {featuredProducts.length} piezas curadas
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
                  foil mood · rareza · vitrina
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950 shadow-[0_14px_32px_rgba(214,186,131,0.22)]"
              >
                <Link href={banner.href}>
                  {banner.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-primary/18 bg-black/20"
              >
                <Link href="/preventa">Ver preventa</Link>
              </Button>
            </div>
          </div>

          <div className="grid h-[330px] grid-rows-[1fr_auto] gap-5 pt-2 sm:h-[380px] sm:gap-6 sm:pt-3 md:h-[430px] lg:h-full lg:min-h-[430px] lg:pt-0 xl:min-h-[500px]">
            <div className="relative mx-auto flex w-full max-w-[520px] items-center justify-center sm:max-w-[580px] md:max-w-[620px] lg:max-w-[660px] xl:max-w-[700px]">
              {heroCards.length === 4 ? (
                <div className="relative h-[238px] w-full overflow-visible sm:h-[282px] md:h-[330px] lg:h-[346px] xl:h-[382px]">
                  {heroCards.map((card, index) => (
                    <div key={`${card.brand}-${card.src}`} className={cn("absolute", heroCardOffsets[index])}>
                      <div className="relative aspect-[660/920]">
                        <Image
                          src={card.src}
                          alt={card.alt}
                          fill
                          className="object-contain object-center drop-shadow-[0_14px_26px_rgba(2,6,23,0.24)]"
                          sizes="(min-width: 1280px) 230px, (min-width: 1024px) 30vw, (min-width: 768px) 34vw, 38vw"
                          priority={index < 2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {heroLogos.length > 0 ? (
              <div
                className="relative overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
                  maskImage:
                    "linear-gradient(90deg, transparent 0%, black 10%, black 90%, transparent 100%)",
                }}
              >
                <div className="hero-logo-marquee flex items-center gap-8 sm:gap-10 md:gap-12">
                  {marqueeLogos.map((card, index) => (
                    <div
                      key={`${card.brand}-logo-${index}`}
                      className="relative flex h-[3.5rem] min-w-[150px] items-end justify-center sm:h-[4rem] sm:min-w-[185px] md:h-[4.5rem] md:min-w-[220px] xl:h-[6rem] xl:min-w-[280px]"
                      style={{
                        filter: `drop-shadow(${brandPalettes[card.slug].logoShadow})`,
                      }}
                    >
                      <Image
                        src={card.logo}
                        alt={`${card.brand} logo`}
                        fill
                        className="object-contain object-bottom opacity-90"
                        sizes="(min-width: 1280px) 280px, (min-width: 768px) 220px, 150px"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
