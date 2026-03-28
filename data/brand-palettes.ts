import type { BrandSlug, BrandTheme } from "@/types/store";

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export type BrandPalette = {
  primary: string;
  secondary: string;
  accent: string;
  danger: string;
  surface: string;
  theme: BrandTheme;
  glyphTone: string;
  glyphGlow: string;
  labelColor: string;
  chipBorder: string;
  chipBackground: string;
  chipText: string;
  spotlightBorder: string;
  spotlightBackground: string;
  actionBorder: string;
  actionBackground: string;
  actionGlow: string;
  artworkGlowPrimary: string;
  artworkGlowSecondary: string;
  logoShadow: string;
};

export const brandPalettes: Record<BrandSlug, BrandPalette> = {
  pokemon: {
    primary: "#F6C90E",
    secondary: "#2F6BFF",
    accent: "#F4D35E",
    danger: "#E63946",
    surface: "#163B73",
    theme: {
      from: "from-[#163B73]",
      via: "via-[#2F6BFF]",
      to: "to-[#F4D35E]",
      glow: "shadow-[0_0_64px_rgba(47,107,255,0.18)]",
    },
    glyphTone: "from-[#F6C90E]/42 via-[#2F6BFF]/22 to-[#F4D35E]/30",
    glyphGlow: "shadow-[0_14px_34px_rgba(47,107,255,0.22)]",
    labelColor: "#F6C90E",
    chipBorder: withAlpha("#2F6BFF", 0.28),
    chipBackground: `linear-gradient(180deg, ${withAlpha("#163B73", 0.5)}, ${withAlpha("#0B1018", 0.68)})`,
    chipText: "#F4D35E",
    spotlightBorder: withAlpha("#F6C90E", 0.24),
    spotlightBackground: `linear-gradient(180deg, ${withAlpha("#163B73", 0.56)}, ${withAlpha("#0B1018", 0.72)})`,
    actionBorder: withAlpha("#2F6BFF", 0.22),
    actionBackground: withAlpha("#163B73", 0.28),
    actionGlow: "0 16px 34px rgba(47, 107, 255, 0.16)",
    artworkGlowPrimary: withAlpha("#F6C90E", 0.16),
    artworkGlowSecondary: withAlpha("#2F6BFF", 0.14),
    logoShadow:
      "drop-shadow(0 0 24px rgba(47, 107, 255, 0.34)) drop-shadow(0 0 68px rgba(246, 201, 14, 0.2))",
  },
  "one-piece": {
    primary: "#D72638",
    secondary: "#1E5AA8",
    accent: "#D4A017",
    danger: "#D72638",
    surface: "#6B4F3A",
    theme: {
      from: "from-[#6B4F3A]",
      via: "via-[#1E5AA8]",
      to: "to-[#D4A017]",
      glow: "shadow-[0_0_64px_rgba(215,38,56,0.16)]",
    },
    glyphTone: "from-[#D72638]/40 via-[#1E5AA8]/22 to-[#D4A017]/28",
    glyphGlow: "shadow-[0_14px_34px_rgba(215,38,56,0.2)]",
    labelColor: "#F4EBD0",
    chipBorder: withAlpha("#D72638", 0.26),
    chipBackground: `linear-gradient(180deg, ${withAlpha("#6B4F3A", 0.56)}, ${withAlpha("#0B1018", 0.7)})`,
    chipText: "#F4EBD0",
    spotlightBorder: withAlpha("#D4A017", 0.24),
    spotlightBackground: `linear-gradient(180deg, ${withAlpha("#1E5AA8", 0.28)}, ${withAlpha("#6B4F3A", 0.42)})`,
    actionBorder: withAlpha("#D72638", 0.22),
    actionBackground: withAlpha("#6B4F3A", 0.28),
    actionGlow: "0 16px 34px rgba(215, 38, 56, 0.16)",
    artworkGlowPrimary: withAlpha("#D72638", 0.14),
    artworkGlowSecondary: withAlpha("#D4A017", 0.14),
    logoShadow:
      "drop-shadow(0 0 24px rgba(215, 38, 56, 0.34)) drop-shadow(0 0 68px rgba(212, 160, 23, 0.2))",
  },
  magic: {
    primary: "#6D28D9",
    secondary: "#2563EB",
    accent: "#F59E0B",
    danger: "#7F1D1D",
    surface: "#374151",
    theme: {
      from: "from-[#374151]",
      via: "via-[#6D28D9]",
      to: "to-[#F59E0B]",
      glow: "shadow-[0_0_64px_rgba(109,40,217,0.18)]",
    },
    glyphTone: "from-[#6D28D9]/42 via-[#2563EB]/20 to-[#F59E0B]/26",
    glyphGlow: "shadow-[0_14px_34px_rgba(109,40,217,0.22)]",
    labelColor: "#F59E0B",
    chipBorder: withAlpha("#6D28D9", 0.28),
    chipBackground: `linear-gradient(180deg, ${withAlpha("#374151", 0.58)}, ${withAlpha("#0B1018", 0.72)})`,
    chipText: "#E5D7FF",
    spotlightBorder: withAlpha("#F59E0B", 0.24),
    spotlightBackground: `linear-gradient(180deg, ${withAlpha("#7F1D1D", 0.28)}, ${withAlpha("#374151", 0.44)})`,
    actionBorder: withAlpha("#6D28D9", 0.24),
    actionBackground: withAlpha("#374151", 0.28),
    actionGlow: "0 16px 34px rgba(109, 40, 217, 0.16)",
    artworkGlowPrimary: withAlpha("#6D28D9", 0.16),
    artworkGlowSecondary: withAlpha("#2563EB", 0.12),
    logoShadow:
      "drop-shadow(0 0 24px rgba(109, 40, 217, 0.34)) drop-shadow(0 0 68px rgba(245, 158, 11, 0.2))",
  },
  riftbound: {
    primary: "#00AEEF",
    secondary: "#14B8A6",
    accent: "#C8A96B",
    danger: "#7C3AED",
    surface: "#123047",
    theme: {
      from: "from-[#123047]",
      via: "via-[#00AEEF]",
      to: "to-[#C8A96B]",
      glow: "shadow-[0_0_64px_rgba(0,174,239,0.18)]",
    },
    glyphTone: "from-[#00AEEF]/42 via-[#14B8A6]/22 to-[#7C3AED]/24",
    glyphGlow: "shadow-[0_14px_34px_rgba(0,174,239,0.22)]",
    labelColor: "#C8A96B",
    chipBorder: withAlpha("#00AEEF", 0.26),
    chipBackground: `linear-gradient(180deg, ${withAlpha("#123047", 0.56)}, ${withAlpha("#0B1018", 0.72)})`,
    chipText: "#D6F9F5",
    spotlightBorder: withAlpha("#C8A96B", 0.22),
    spotlightBackground: `linear-gradient(180deg, ${withAlpha("#123047", 0.58)}, ${withAlpha("#7C3AED", 0.18)})`,
    actionBorder: withAlpha("#14B8A6", 0.24),
    actionBackground: withAlpha("#123047", 0.3),
    actionGlow: "0 16px 34px rgba(0, 174, 239, 0.16)",
    artworkGlowPrimary: withAlpha("#00AEEF", 0.14),
    artworkGlowSecondary: withAlpha("#14B8A6", 0.12),
    logoShadow:
      "drop-shadow(0 0 24px rgba(0, 174, 239, 0.34)) drop-shadow(0 0 68px rgba(20, 184, 166, 0.2))",
  },
  accesorios: {
    primary: "#D6B782",
    secondary: "#94A3B8",
    accent: "#E7D7B3",
    danger: "#B45309",
    surface: "#1F2937",
    theme: {
      from: "from-slate-300/20",
      via: "via-amber-300/10",
      to: "to-sky-300/20",
      glow: "shadow-[0_0_60px_rgba(226,232,240,0.12)]",
    },
    glyphTone: "from-slate-200/24 via-amber-300/12 to-slate-400/20",
    glyphGlow: "shadow-[0_14px_34px_rgba(148,163,184,0.16)]",
    labelColor: "#E7D7B3",
    chipBorder: withAlpha("#94A3B8", 0.22),
    chipBackground: `linear-gradient(180deg, ${withAlpha("#1F2937", 0.58)}, ${withAlpha("#0B1018", 0.72)})`,
    chipText: "#E2E8F0",
    spotlightBorder: withAlpha("#D6B782", 0.18),
    spotlightBackground: `linear-gradient(180deg, ${withAlpha("#1F2937", 0.58)}, ${withAlpha("#0B1018", 0.72)})`,
    actionBorder: withAlpha("#94A3B8", 0.2),
    actionBackground: withAlpha("#1F2937", 0.28),
    actionGlow: "0 16px 34px rgba(148, 163, 184, 0.14)",
    artworkGlowPrimary: withAlpha("#D6B782", 0.1),
    artworkGlowSecondary: withAlpha("#94A3B8", 0.1),
    logoShadow:
      "drop-shadow(0 0 22px rgba(148, 163, 184, 0.28)) drop-shadow(0 0 58px rgba(214, 183, 130, 0.18))",
  },
  preventa: {
    primary: "#F59E0B",
    secondary: "#38BDF8",
    accent: "#E879F9",
    danger: "#FB7185",
    surface: "#312E81",
    theme: {
      from: "from-fuchsia-500/25",
      via: "via-sky-400/15",
      to: "to-amber-400/25",
      glow: "shadow-[0_0_60px_rgba(217,70,239,0.18)]",
    },
    glyphTone: "from-fuchsia-300/30 via-sky-300/16 to-amber-300/24",
    glyphGlow: "shadow-[0_14px_34px_rgba(217,70,239,0.18)]",
    labelColor: "#FDE68A",
    chipBorder: withAlpha("#E879F9", 0.22),
    chipBackground: `linear-gradient(180deg, ${withAlpha("#312E81", 0.56)}, ${withAlpha("#0B1018", 0.72)})`,
    chipText: "#F8E8FF",
    spotlightBorder: withAlpha("#F59E0B", 0.18),
    spotlightBackground: `linear-gradient(180deg, ${withAlpha("#312E81", 0.58)}, ${withAlpha("#0B1018", 0.72)})`,
    actionBorder: withAlpha("#38BDF8", 0.2),
    actionBackground: withAlpha("#312E81", 0.28),
    actionGlow: "0 16px 34px rgba(232, 121, 249, 0.14)",
    artworkGlowPrimary: withAlpha("#F59E0B", 0.1),
    artworkGlowSecondary: withAlpha("#38BDF8", 0.1),
    logoShadow:
      "drop-shadow(0 0 24px rgba(232, 121, 249, 0.3)) drop-shadow(0 0 64px rgba(56, 189, 248, 0.18))",
  },
};

export const brandThemes = Object.fromEntries(
  Object.entries(brandPalettes).map(([slug, palette]) => [slug, palette.theme]),
) as Record<BrandSlug, BrandTheme>;
