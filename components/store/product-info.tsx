"use client";

import Link from "next/link";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { storefrontMotionEase } from "@/lib/storefront-motion";
import type { ProductDetail } from "@/types/contracts";

export function ProductInfo({ product }: { product: ProductDetail }) {
  const [quantity, setQuantity] = useState(1);
  const shouldReduceMotion = useReducedMotion();
  const productExpansion = product.expansion ?? product.category.label;
  const productFormat = product.format ?? product.category.label;
  const productLanguage = product.language ?? "ES";

  const revealProps = {
    initial: shouldReduceMotion ? false : { opacity: 0, y: 16 },
    animate: shouldReduceMotion ? undefined : { opacity: 1, y: 0 },
    transition: { duration: 0.48, ease: storefrontMotionEase },
  } as const;

  return (
    <div className="space-y-6">
      <motion.div
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.04 }}
        className="space-y-4"
      >
        <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          {[product.brand.label, productExpansion, productFormat, productLanguage, product.variant]
            .filter((value): value is string => Boolean(value))
            .map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5"
              >
                {value}
              </span>
            ))}
        </div>

        {product.badge ? (
          <div className="flex flex-wrap gap-2">
            <Badge>{product.badge}</Badge>
          </div>
        ) : null}

        <div>
          <h1 className="font-heading text-[1.9rem] font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-[2.35rem] md:text-[3.35rem] md:leading-[1.02]">
            {product.name}
          </h1>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-7 text-slate-300 md:mt-4 md:text-base md:leading-8">
            {product.description}
          </p>
        </div>
      </motion.div>

      <motion.div
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.1 }}
        className="anime-panel rounded-[28px] p-5"
      >
        <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          {product.details.map((detail) => (
            <InfoLine key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </div>
      </motion.div>

      <motion.div
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.16 }}
        className="surface-panel border-primary/16 p-5 md:p-6"
      >
        <div aria-hidden="true" className="collector-constellation pointer-events-none absolute inset-0 opacity-35" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[18%] top-0 h-24 rounded-full bg-white/[0.06] blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-4 left-[14%] h-16 w-[42%] rounded-full bg-primary/14 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Estado de compra
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2.5 md:gap-3">
                <span className="font-heading text-[2.2rem] font-semibold text-white md:text-4xl">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice ? (
                  <span className="text-lg text-slate-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {product.isPreorder
                  ? "Reserva activa. Si el lanzamiento sigue abierto, puedes asegurar tu unidad ahora."
                  : product.stockLabel}
              </p>
            </div>

            <div className="hidden rounded-[22px] border border-white/10 bg-black/[0.25] px-4 py-3 text-sm text-slate-200 sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Preparado para colección
              </p>
              <p className="mt-2 leading-6">
                Visual claro, checkout seguro y lectura rápida de expansión, formato e idioma.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:gap-4 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="mx-auto flex items-center rounded-full border border-white/10 bg-black/20 lg:mx-0" role="group" aria-label="Selector de cantidad">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="px-4 py-3 text-slate-200 transition-colors hover:text-white"
                aria-label="Reducir cantidad"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold text-white" aria-live="polite" aria-atomic="true">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="px-4 py-3 text-slate-200 transition-colors hover:text-white"
                aria-label="Aumentar cantidad"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <AddToCartButton
              productId={product.id}
              quantity={quantity}
              snapshot={{
                slug: product.slug,
                href: product.href,
                name: product.name,
                description: product.description,
                image: product.image,
                brandLabel: product.brand.label,
                expansion: product.expansion,
                unitPrice: product.price,
                stock: product.stock,
                isPreorder: product.isPreorder,
              }}
              disabled={product.stock < 1 && !product.isPreorder}
              idleLabel={product.isPreorder ? "Reservar ahora" : "Añadir al carrito"}
              addedLabel={product.isPreorder ? "Reserva añadida" : "Añadido al carrito"}
              size="lg"
              className="h-14 w-full rounded-[22px] bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950 shadow-[0_18px_42px_rgba(214,186,131,0.24)]"
            />
          </div>

          <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/[0.08] bg-black/[0.15] p-4">
              <Truck className="mb-3 h-5 w-5 text-primary" />
              Envío rápido y embalaje cuidado para producto de colección.
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-black/[0.15] p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
              Pago seguro con Stripe y confirmación por email tras la compra.
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...revealProps}
        transition={{ ...revealProps.transition, delay: 0.22 }}
        className="grid gap-4 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-slate-300 md:p-5"
      >
        <div>
          <h2 className="font-heading text-lg font-semibold text-white sm:text-xl">Sobre la pieza</h2>
          <p className="mt-3">
            Todo lo importante del producto está visible de un vistazo: expansión, formato,
            idioma, variante, precio y disponibilidad.
          </p>
        </div>

        <div>
          <h2 className="font-heading text-xl font-semibold text-white">Tags</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-black/[0.15] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/carrito"
          className="text-sm font-semibold text-primary transition-colors hover:text-white"
        >
          Ver carrito actual
        </Link>
      </motion.div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm text-white">{value}</p>
    </div>
  );
}
