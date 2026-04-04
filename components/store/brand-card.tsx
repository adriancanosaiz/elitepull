import fs from "node:fs";
import path from "node:path";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandGlyph } from "@/components/store/brand-glyph";
import { brandPalettes } from "@/data/brand-palettes";
import { brandMedia, type BrandMedia } from "@/data/brand-media";
import type { Brand } from "@/types/store";
import { cn } from "@/lib/utils";

function publicFileExists(src: string) {
  const filePath = path.join(process.cwd(), "public", src.replace(/^\//, ""));
  return fs.existsSync(filePath);
}

function getBrandArtwork(brand: Brand): BrandMedia | null {
  const media = brandMedia[brand.slug];

  if (!media) {
    return null;
  }

  const availableGallery = media.gallery?.filter((src) => publicFileExists(src)) ?? [];

  if (availableGallery.length >= 3) {
    return {
      ...media,
      gallery: availableGallery.slice(0, 3),
    };
  }

  if (media.src && publicFileExists(media.src)) {
    return media;
  }

  return null;
}

function getBrandLogo(brand: Brand) {
  const logo = brandMedia[brand.slug]?.logo;

  if (!logo || !publicFileExists(logo)) {
    return undefined;
  }

  return logo;
}

function BrandLogo({
  brand,
  className,
  sizes,
  imageClassName,
}: {
  brand: Brand;
  className: string;
  sizes: string;
  imageClassName?: string;
}) {
  const logo = getBrandLogo(brand);
  const palette = brandPalettes[brand.slug];

  if (!logo) {
    return null;
  }

  return (
    <div className={className} style={{ filter: palette.logoShadow }}>
      <Image
        src={logo}
        alt={`${brand.name} logo`}
        fill
        className={cn("object-contain object-center", imageClassName)}
        sizes={sizes}
        quality={74}
      />
    </div>
  );
}

export function BrandCard({
  brand,
  imageSide = "left",
  compact = false,
}: {
  brand: Brand;
  imageSide?: "left" | "right";
  compact?: boolean;
}) {
  const artwork = getBrandArtwork(brand);
  const gallery = artwork?.gallery;
  const logo = getBrandLogo(brand);
  const palette = brandPalettes[brand.slug];

  if (compact) {
    return (
      <Link
        href={brand.href}
        className={cn(
          "surface-panel vault-sheen group block overflow-hidden border-primary/14 p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-[0_28px_70px_rgba(2,6,23,0.34)] sm:p-6",
          brand.theme.glow,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-45",
            brand.theme.from,
            brand.theme.via,
            brand.theme.to,
          )}
        />
        <div className="vault-grid absolute inset-0 opacity-[0.05]" />
        <div className="shine-pass" />
        <div className="collector-constellation absolute inset-0 opacity-30" />

        <div className="relative grid h-full grid-cols-[1fr_116px] gap-4 sm:grid-cols-[1fr_180px] sm:items-center sm:gap-6">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
                {logo ? (
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                      {brand.slug === "preventa" ? "Acceso anticipado" : "Colección protegida"}
                    </p>
                    <BrandLogo
                      brand={brand}
                      className="relative mt-3 h-20 w-full max-w-[250px] sm:h-24 sm:max-w-[310px]"
                      sizes="(min-width: 640px) 310px, 250px"
                    />
                    <h3 className="sr-only">{brand.name}</h3>
                  </div>
                ) : (
                  <>
                    <BrandGlyph brand={brand.slug} size="lg" className="hidden sm:inline-flex" />
                    <BrandGlyph brand={brand.slug} size="md" className="sm:hidden" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                        {brand.slug === "preventa" ? "Acceso anticipado" : "Colección protegida"}
                      </p>
                      <h3 className="mt-2 font-heading text-xl font-semibold text-white sm:text-2xl">
                        {brand.name}
                      </h3>
                    </div>
                  </>
                )}
              </div>

              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-transform duration-500 group-hover:translate-x-0.5"
                style={{
                  border: `1px solid ${palette.actionBorder}`,
                  background: palette.actionBackground,
                  boxShadow: palette.actionGlow,
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-100/86 sm:mt-4 sm:leading-7">
              {brand.tagline}
            </p>

            <div
              className="mt-5 rounded-[22px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              style={{
                border: `1px solid ${palette.spotlightBorder}`,
                background: palette.spotlightBackground,
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                En foco
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100/86">{brand.spotlight}</p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[180px]">
            <div className="relative aspect-[0.82] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_24%),linear-gradient(180deg,rgba(8,11,18,0.92),rgba(14,18,28,0.96))] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.32)] [contain:layout_paint]">
              <div className="collector-constellation absolute inset-0 opacity-35" />
              <div className="shine-pass" />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-30",
                  brand.theme.from,
                  brand.theme.via,
                  brand.theme.to,
                )}
              />
              <div
                className="absolute inset-x-[18%] top-[18%] h-[18%] rounded-full blur-3xl"
                style={{ backgroundColor: palette.artworkGlowPrimary }}
              />
              {artwork?.src ? (
                <Image
                  src={artwork.src}
                  alt={artwork.alt}
                  fill
                  className="object-cover object-center opacity-90 transition-[transform,filter] duration-700 group-hover:scale-[1.02] group-hover:brightness-[1.04]"
                  loading="lazy"
                  sizes="180px"
                  quality={68}
                />
              ) : (
                <div className="relative flex h-full items-center justify-center">
                  <BrandGlyph brand={brand.slug} size="lg" className="h-28 w-28 rounded-[28px]" />
                </div>
              )}
              <div className="collector-vignette absolute inset-0 opacity-70" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  const visualOnRight = imageSide === "right";
  const hasGallery = Boolean(gallery?.length);

  return (
    <Link
      href={brand.href}
      className={cn(
        "surface-panel vault-sheen group block overflow-hidden border-primary/16 p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-0.5 hover:border-white/[0.18] hover:shadow-[0_34px_90px_rgba(2,6,23,0.38)] sm:p-6",
        brand.theme.glow,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          brand.theme.from,
          brand.theme.via,
          brand.theme.to,
        )}
      />
      <div className="vault-grid absolute inset-0 opacity-[0.05]" />
      <div className="shine-pass" />
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.16] to-transparent" />

      <div className="relative grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-6">
        <div
          className={cn(
            "order-2",
            visualOnRight ? "lg:order-2" : "lg:order-1",
          )}
        >
          <div className="relative mx-auto max-w-[440px]">
            <div className="relative aspect-[1.02] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_22%),linear-gradient(180deg,rgba(8,11,18,0.92),rgba(14,18,28,0.96))] p-4 shadow-[0_24px_60px_rgba(2,6,23,0.42),inset_0_1px_0_rgba(255,255,255,0.05)] transition-transform duration-700 group-hover:scale-[1.008] sm:aspect-[0.94] sm:rounded-[32px] sm:p-6 [contain:layout_paint]">
              <div className="absolute inset-0 vault-grid opacity-[0.04]" />
              <div className="absolute inset-0 collector-constellation opacity-40" />
              <div className="shine-pass" />
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-30",
                  brand.theme.from,
                  brand.theme.via,
                  brand.theme.to,
                )}
              />

              {hasGallery ? (
                <>
                  <div
                    className="absolute inset-x-[20%] top-[34%] h-[16%] rounded-full blur-3xl"
                    style={{ backgroundColor: palette.artworkGlowPrimary }}
                  />
                  <div
                    className="absolute inset-x-[26%] top-[42%] h-[14%] rounded-full blur-3xl"
                    style={{ backgroundColor: palette.artworkGlowSecondary }}
                  />

                  <div className="absolute left-[6%] top-[28%] z-[1] w-[30.5%] rotate-[-14deg]">
                    <div className="relative aspect-[660/920] transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.012]">
                      <Image
                        src={gallery![0]}
                        alt={`${artwork?.alt ?? brand.name} 1`}
                        fill
                        className="object-contain object-center drop-shadow-[0_18px_32px_rgba(2,6,23,0.45)] transition-[transform,filter] duration-700 group-hover:brightness-[1.03]"
                        loading="lazy"
                        sizes="200px"
                        quality={70}
                      />
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-[20%] z-[3] w-[34%] -translate-x-1/2">
                    <div className="relative aspect-[660/920] transition-transform duration-700 group-hover:-translate-y-1.5 group-hover:scale-[1.015]">
                      <Image
                        src={gallery![1]}
                        alt={`${artwork?.alt ?? brand.name} 2`}
                        fill
                        className="object-contain object-center drop-shadow-[0_24px_40px_rgba(2,6,23,0.5)] transition-[transform,filter] duration-700 group-hover:brightness-[1.05]"
                        loading="lazy"
                        sizes="220px"
                        quality={72}
                      />
                    </div>
                  </div>

                  <div className="absolute right-[6%] top-[28%] z-[1] w-[30.5%] rotate-[14deg]">
                    <div className="relative aspect-[660/920] transition-transform duration-700 group-hover:-translate-y-1 group-hover:scale-[1.012]">
                      <Image
                        src={gallery![2]}
                        alt={`${artwork?.alt ?? brand.name} 3`}
                        fill
                        className="object-contain object-center drop-shadow-[0_18px_32px_rgba(2,6,23,0.45)] transition-[transform,filter] duration-700 group-hover:brightness-[1.03]"
                        loading="lazy"
                        sizes="200px"
                        quality={70}
                      />
                    </div>
                  </div>
                </>
              ) : artwork?.src ? (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_24%),linear-gradient(180deg,rgba(8,11,18,0.15),rgba(8,11,18,0.4))]" />
                  <Image
                    src={artwork.src}
                    alt={artwork.alt}
                    fill
                    className="object-cover object-center opacity-88 transition-[transform,filter] duration-900 group-hover:scale-[1.015] group-hover:brightness-[1.03]"
                    loading="lazy"
                    sizes="(min-width: 1024px) 420px, 100vw"
                    quality={70}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,10,16,0.04),rgba(7,10,16,0.48),rgba(7,10,16,0.82))]" />
                </>
              ) : (
                <>
                  <div className="absolute left-[10%] top-[14%] h-[56%] w-[34%] rotate-[-12deg] rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(30,37,49,0.84),rgba(10,13,20,0.95))] shadow-[0_18px_38px_rgba(2,6,23,0.34)]" />
                  <div className="absolute right-[12%] top-[12%] h-[54%] w-[30%] rotate-[12deg] rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(22,28,40,0.84),rgba(8,11,18,0.95))] shadow-[0_18px_38px_rgba(2,6,23,0.34)]" />
                  <div className="absolute left-1/2 top-[18%] h-[50%] w-[32%] -translate-x-1/2 rounded-[30px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(34,42,56,0.88),rgba(10,13,20,0.96))] shadow-[0_24px_50px_rgba(2,6,23,0.38)]" />
                  <div
                    className="absolute inset-x-[22%] top-[26%] h-[24%] rounded-full blur-3xl"
                    style={{ backgroundColor: palette.artworkGlowPrimary }}
                  />
                  <div
                    className="absolute inset-x-[28%] top-[32%] h-[18%] rounded-full blur-3xl"
                    style={{ backgroundColor: palette.artworkGlowSecondary }}
                  />
                </>
              )}

            </div>
          </div>
        </div>

        <div
          className={cn(
            "order-1 w-full max-w-xl text-center lg:text-left",
            visualOnRight ? "lg:order-1" : "lg:order-2",
          )}
        >
          {logo ? (
            <>
              <div
                className="flex w-full items-center justify-start gap-3 text-[10px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: palette.labelColor }}
              >
                <span className="signal-line h-px w-10" />
                {brand.shortName}
              </div>
              <BrandLogo
                brand={brand}
                className="relative mx-auto mt-4 h-24 w-full max-w-[340px] sm:h-32 sm:max-w-[520px] lg:mx-0 lg:h-40 lg:max-w-[700px]"
                sizes="(min-width: 1024px) 700px, (min-width: 640px) 520px, 340px"
                imageClassName={cn(
                  brand.slug === "pokemon" && "brightness-110 contrast-125 saturate-125",
                )}
              />
              <h3 className="sr-only">{brand.name}</h3>
            </>
          ) : (
            <>
              <div
                className="flex w-full items-center justify-start gap-3 text-[10px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: palette.labelColor }}
              >
                <span className="signal-line h-px w-10" />
                {brand.shortName}
              </div>
              <h3 className="mt-3 font-heading text-[2.35rem] font-semibold tracking-tight text-white sm:text-5xl">
                {brand.name}
              </h3>
            </>
          )}
          <p className="mt-3 text-sm leading-7 text-slate-100/88 sm:text-[15px] sm:mt-4 sm:leading-7">
            {brand.tagline}
          </p>
          {/* Description hidden on mobile — too much text */}
          <p className="mt-3 hidden text-sm leading-7 text-slate-300 sm:mt-4 sm:block">{brand.description}</p>

          <div
            className="mt-4 hidden rounded-[22px] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:mt-6 sm:block sm:rounded-[24px] sm:p-5"
            style={{
              border: `1px solid ${palette.spotlightBorder}`,
              background: palette.spotlightBackground,
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              En foco
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-100/86">{brand.spotlight}</p>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_auto] items-start gap-4 border-t border-white/[0.08] pt-4 text-left sm:mt-6 sm:pt-5">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Entrar en el universo
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Explora sellado, singles y producto destacado.
              </p>
            </div>
            <span
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:translate-x-1"
              style={{
                border: `1px solid ${palette.actionBorder}`,
                background: palette.actionBackground,
                boxShadow: palette.actionGlow,
              }}
            >
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
