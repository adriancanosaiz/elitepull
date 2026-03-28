"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { storefrontMotionEase, storefrontRevealTransition } from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";
import type { PromoBanner } from "@/types/store";

export function PromoBanner({ banner }: { banner: PromoBanner }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.992 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={storefrontRevealTransition}
    >
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
        <div className="collector-constellation absolute inset-0 opacity-35" />
        <div className="kinetic-lines absolute inset-0 opacity-[0.08]" />
        <div className="shine-pass" />
        <motion.div
          whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
          transition={{ duration: 0.8, ease: storefrontMotionEase }}
          className="absolute inset-0"
        >
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            className="object-cover opacity-20 mix-blend-screen"
          />
        </motion.div>

        <div className="relative flex min-h-[280px] flex-col justify-between gap-8">
          <div className="max-w-md">
            <h3 className="font-heading text-3xl font-semibold text-white">{banner.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-100/82">{banner.subtitle}</p>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            {banner.ctaLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
