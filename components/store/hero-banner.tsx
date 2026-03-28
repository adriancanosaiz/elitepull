"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { brands } from "@/data/brands";
import { brandMedia } from "@/data/brand-media";
import { brandPalettes } from "@/data/brand-palettes";
import { storefrontMotionEase } from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";
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
}: {
  banner: PromoBanner;
}) {
  const shouldReduceMotion = useReducedMotion();
  const heroIntroTransition = {
    duration: 0.82,
    ease: storefrontMotionEase,
  } as const;
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
    <section className="app-container pb-4 pt-3 sm:pb-8 sm:pt-8 md:pb-12 md:pt-10">
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

        <div className="relative grid min-h-[calc(100svh-7.25rem)] grid-rows-[auto_1fr] gap-5 px-5 py-5 sm:min-h-0 sm:gap-8 sm:px-8 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-1 lg:items-stretch xl:min-h-[540px]">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={heroIntroTransition}
            className="flex max-w-xl flex-col items-center gap-6 text-center sm:items-start sm:text-left lg:h-full lg:max-w-2xl lg:justify-between lg:gap-8"
          >
            <div>
              <motion.h1
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(12px)" }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...heroIntroTransition, delay: 0.08 }}
                className="mx-auto max-w-[13ch] font-heading text-[2.7rem] font-semibold leading-[0.94] tracking-[-0.045em] text-white sm:mx-0 sm:max-w-[11ch] sm:text-5xl md:text-6xl"
              >
                {banner.title}
              </motion.h1>
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...heroIntroTransition, delay: 0.18 }}
                className="mx-auto mt-4 max-w-[30rem] text-balance text-[0.96rem] leading-7 text-slate-100/88 sm:mx-0 sm:mt-5 sm:max-w-xl sm:text-base sm:leading-8"
              >
                {banner.subtitle}
              </motion.p>
              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...heroIntroTransition, delay: 0.3 }}
                className="mx-auto mt-3 hidden max-w-xl text-sm leading-7 text-slate-200/78 sm:mx-0 sm:mt-4 sm:block"
              >
                {banner.description}
              </motion.p>

              <motion.p
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(10px)" }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ ...heroIntroTransition, delay: 0.42 }}
                className="mt-5 hidden text-sm leading-7 text-slate-200/82 lg:block"
              >
                Marcas principales, producto seleccionado y una navegación pensada para encontrar
                rápido lo que te interesa.
              </motion.p>
            </div>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...heroIntroTransition, delay: 0.54 }}
              className="hidden sm:flex sm:flex-col sm:gap-3 lg:flex-row"
            >
              <Button
                asChild
                size="lg"
                className="h-12 w-full justify-between bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950 shadow-[0_14px_32px_rgba(214,186,131,0.22)] sm:w-auto sm:justify-center"
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
                className="h-12 w-full border-primary/18 bg-black/20 sm:w-auto"
              >
                <Link href="/preventa">Ver preventa</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.992, filter: "blur(12px)" }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            transition={{ ...heroIntroTransition, delay: 0.26 }}
            className="grid content-end gap-4 pt-1 sm:h-[380px] sm:grid-rows-[1fr_auto] sm:gap-6 sm:pt-3 md:h-[430px] lg:h-full lg:min-h-[430px] lg:pt-0 xl:min-h-[500px]"
          >
            <div className="relative mx-auto hidden w-full max-w-[420px] items-center justify-center sm:flex sm:max-w-[580px] md:max-w-[620px] lg:max-w-[660px] xl:max-w-[700px]">
              {heroCards.length === 4 ? (
                <div className="relative h-[188px] w-full overflow-visible sm:h-[282px] md:h-[330px] lg:h-[346px] xl:h-[382px]">
                  {heroCards.map((card, index) => (
                    <div
                      key={`${card.brand}-${card.src}`}
                      className={cn("absolute", heroCardOffsets[index])}
                    >
                      <motion.div
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                y: [0, index % 2 === 0 ? -10 : -6, 0],
                              }
                        }
                        transition={
                          shouldReduceMotion
                            ? undefined
                            : {
                                duration: index % 2 === 0 ? 7.4 : 8.2,
                                ease: storefrontMotionEase,
                                repeat: Number.POSITIVE_INFINITY,
                              }
                        }
                        className={cn(
                          "relative aspect-[660/920]",
                          index % 2 === 0 ? "hero-card-float" : "hero-card-float-delay",
                        )}
                      >
                        <Image
                          src={card.src}
                          alt={card.alt}
                          fill
                          className="object-contain object-center drop-shadow-[0_14px_26px_rgba(2,6,23,0.24)]"
                          sizes="(min-width: 1280px) 230px, (min-width: 1024px) 30vw, (min-width: 768px) 34vw, 38vw"
                          quality={70}
                          priority={index === 1}
                        />
                      </motion.div>
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
                <div className="hero-logo-marquee flex items-center gap-4 sm:gap-10 md:gap-12">
                  {marqueeLogos.map((card, index) => (
                    <div
                      key={`${card.brand}-logo-${index}`}
                      className="relative flex h-[4.65rem] min-w-[184px] items-center justify-center px-1 sm:h-[4rem] sm:min-w-[185px] sm:items-end sm:px-0 md:h-[4.5rem] md:min-w-[220px] xl:h-[6rem] xl:min-w-[280px]"
                      style={{
                        filter: `drop-shadow(${brandPalettes[card.slug].logoShadow})`,
                      }}
                    >
                      <Image
                        src={card.logo}
                        alt={`${card.brand} logo`}
                        fill
                        className="object-contain object-center opacity-95 sm:object-bottom"
                        sizes="(min-width: 1280px) 280px, (min-width: 768px) 220px, 184px"
                        quality={72}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...heroIntroTransition, delay: 0.54 }}
              className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:hidden"
            >
              <Button
                asChild
                size="lg"
                className="h-12 w-full justify-center bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950 shadow-[0_14px_32px_rgba(214,186,131,0.22)]"
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
                className="h-12 w-full justify-center border-primary/18 bg-black/20"
              >
                <Link href="/preventa">Ver preventa</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
