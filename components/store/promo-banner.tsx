import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PromoBanner } from "@/types/store";

export function PromoBanner({ banner }: { banner: PromoBanner }) {
  return (
    <Link
      href={banner.href}
      className="surface-card group relative block overflow-hidden p-6"
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          banner.theme.from,
          banner.theme.via,
          banner.theme.to,
        )}
      />
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        className="object-cover opacity-20 mix-blend-screen transition-transform duration-500 group-hover:scale-105"
      />

      <div className="relative flex min-h-[280px] flex-col justify-between gap-8">
        <div className="max-w-md">
          <span className="eyebrow-label border-white/[0.15] bg-black/[0.15] text-slate-100">
            Curated showcase
          </span>
          <h3 className="mt-5 font-heading text-3xl font-semibold text-white">
            {banner.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-100/82">{banner.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          {banner.ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
