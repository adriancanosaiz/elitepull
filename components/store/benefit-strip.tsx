"use client";

import { BadgeCheck, MessageSquareMore, ShieldCheck, Truck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { benefits } from "@/data/site";
import { storefrontMotionEase } from "@/lib/storefront-motion";

const icons = {
  shipping: Truck,
  stock: BadgeCheck,
  secure: ShieldCheck,
  support: MessageSquareMore,
} as const;

export function BenefitStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="app-container scroll-defer py-10">
      <div className="surface-panel px-5 py-6 sm:px-6 sm:py-7">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
              <span className="signal-line h-px w-10" />
              Protocolos de compra
            </div>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-[-0.03em] text-white md:text-4xl">
              La parte útil de la experiencia también se siente premium
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            Packaging cuidado, disponibilidad clara y soporte pensado para coleccionistas que no
            quieren perder tiempo adivinando.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = icons[benefit.id as keyof typeof icons];

            return (
              <motion.div
                key={benefit.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.58,
                  delay: index * 0.12,
                  ease: storefrontMotionEase,
                }}
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                className="surface-soft anime-panel group px-5 py-5 transition-shadow duration-300 hover:shadow-[0_22px_48px_rgba(2,6,23,0.24)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-primary transition-transform duration-300 group-hover:scale-[1.06]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
