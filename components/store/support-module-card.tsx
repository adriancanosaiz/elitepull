
import Link from "next/link";
import { ArrowRight, Clock3, Shield } from "lucide-react";

import { brandPalettes } from "@/data/brand-palettes";
import type { Brand } from "@/types/store";
import { cn } from "@/lib/utils";

export function SupportModuleCard({ brand }: { brand: Brand }) {
  const palette = brandPalettes[brand.slug];
  const isPreventa = brand.slug === "preventa";
  const Icon = isPreventa ? Clock3 : Shield;

  // Use the hero images defined in the project
  const imageSrc = `/brands/${brand.slug}/hero.webp`;

  return (
    <Link
      href={brand.href}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-[24px] border border-white/10 p-5 transition-[transform,border-color,box-shadow] duration-500 hover:-translate-y-1 hover:border-white/[0.18] hover:shadow-[0_24px_50px_rgba(2,6,23,0.38)] sm:rounded-[32px] sm:p-6",
        brand.theme.glow,
      )}
    >
      {/* Background Gradients & Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,24,0.6)_0%,rgba(6,8,14,0.95)_100%)]" />
      <div className="collector-constellation absolute inset-0 opacity-50 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-75" />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-25 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-40",
          brand.theme.from,
          brand.theme.to,
        )}
      />

      <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
        <div className="flex items-center justify-between gap-4">
          {/* Badge */}
          <div className="flex w-max items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 backdrop-blur-md">
            <Icon className="h-3.5 w-3.5 text-white/80" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
              {isPreventa ? "Acceso anticipado" : "Calidad premium"}
            </span>
          </div>

          <span
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-500 group-hover:scale-105 sm:h-11 sm:w-11 sm:rounded-2xl"
            style={{
              border: `1px solid ${palette.actionBorder}`,
              background: palette.actionBackground,
              boxShadow: palette.actionGlow,
            }}
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="font-heading text-2xl font-semibold text-white sm:text-3xl">
            {brand.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
            {brand.tagline}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:gap-2.5">
          {brand.categories.slice(0, 3).map((cat) => (
            <span
              key={cat.slug}
              className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors group-hover:border-white/10 group-hover:bg-white/[0.06]"
            >
              {cat.label}
            </span>
          ))}
          {brand.categories.length > 3 && (
            <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-500">
              +{brand.categories.length - 3} más
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
