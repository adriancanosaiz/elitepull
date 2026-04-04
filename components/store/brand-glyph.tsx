"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Anchor,
  Clock3,
  Flame,
  Gem,
  Shield,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { brandPalettes } from "@/data/brand-palettes";
import { cn } from "@/lib/utils";
import type { BrandSlug } from "@/types/store";

export const brandGlyphConfig: Record<
  BrandSlug,
  {
    icon: LucideIcon;
    monogram: string;
    assetSrc?: string;
  }
> = {
  pokemon: {
    icon: Zap,
    monogram: "PK",
    assetSrc: "/brands/pokemon/pokemon-icon.png",
  },
  "one-piece": {
    icon: Anchor,
    monogram: "OP",
    assetSrc: "/brands/one-piece/onepiece-icon.png",
  },
  riftbound: {
    icon: Gem,
    monogram: "RB",
    assetSrc: "/brands/riftbound/riftbound-icon.png",
  },
  magic: {
    icon: Flame,
    monogram: "MT",
    assetSrc: "/brands/magic/magic-icon.png",
  },
  accesorios: {
    icon: Shield,
    monogram: "AX",
  },
  preventa: {
    icon: Clock3,
    monogram: "PR",
  },
};

export function BrandGlyph({
  brand,
  className,
  size = "md",
}: {
  brand: BrandSlug;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const config = brandGlyphConfig[brand];
  const palette = brandPalettes[brand];
  const Icon = config.icon;
  const [assetFailed, setAssetFailed] = useState(false);

  useEffect(() => {
    setAssetFailed(false);
  }, [brand]);

  const showAsset = Boolean(config.assetSrc && !assetFailed);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,13,20,0.92),rgba(18,23,34,0.8))] text-white shadow-[0_12px_28px_rgba(2,6,23,0.28),inset_0_1px_0_rgba(255,255,255,0.06)]",
        palette.glyphGlow,
        size === "sm" && "h-10 w-10 rounded-[14px]",
        size === "md" && "h-12 w-12 rounded-[16px]",
        size === "lg" && "h-14 w-14 rounded-[18px]",
        className,
      )}
      aria-hidden="true"
    >
      <span className={cn("absolute inset-0 bg-gradient-to-br opacity-80", palette.glyphTone)} />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_34%)]" />
      <span className="absolute inset-[1px] rounded-[inherit] border border-white/[0.06]" />
      <span className="absolute inset-[10%] rounded-[inherit] border border-black/25 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_28%),linear-gradient(180deg,rgba(8,11,18,0.18),rgba(8,11,18,0.34))]" />
      <span className="absolute inset-[18%] rounded-[inherit] border border-white/[0.06] bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(180deg,rgba(21,27,38,0.88),rgba(9,12,19,0.94))]" />

      {showAsset ? (
        <>
          <span className="absolute inset-[22%] z-[2]">
            <Image
              src={config.assetSrc!}
              alt=""
              fill
              sizes="56px"
              onError={() => setAssetFailed(true)}
              className="object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.28)]"
            />
          </span>
          <span
            className="absolute inset-[12%] rounded-[inherit]"
            style={{ border: `1px solid ${palette.actionBorder}` }}
          />
          <span className="absolute inset-[6%] rounded-[inherit] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_24%)] opacity-70" />
        </>
      ) : (
        <>
          <Icon
            className={cn(
              "relative z-[1]",
              size === "sm" && "h-4.5 w-4.5",
              size === "md" && "h-5 w-5",
              size === "lg" && "h-6 w-6",
            )}
          />
          <span
            className="absolute bottom-1.5 right-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em]"
            style={{
              border: `1px solid ${palette.actionBorder}`,
              background: palette.actionBackground,
              color: palette.labelColor,
            }}
          >
            {config.monogram}
          </span>
        </>
      )}
    </span>
  );
}
