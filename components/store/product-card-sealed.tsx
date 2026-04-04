"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCardBadgeRow } from "@/components/store/product-card-badge-row";
import { SpotlightCard } from "@/components/store/spotlight-card";
import { StoreMediaImage } from "@/components/store/store-media-image";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import {
  storefrontCardHoverOffset,
  storefrontCardTransition,
  storefrontRevealOffset,
} from "@/lib/storefront-motion";
import type { ProductCardItem } from "@/types/contracts";

export function ProductCardSealed({ product }: { product: ProductCardItem }) {
  const isDisabled = product.stock < 1 && !product.isPreorder;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: storefrontRevealOffset }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={storefrontCardTransition}
      whileHover={shouldReduceMotion ? undefined : { y: storefrontCardHoverOffset }}
      className="surface-card group vault-sheen flex h-full flex-col overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,16,27,0.98),rgba(10,14,23,0.88))] shadow-[0_14px_36px_rgba(4,8,18,0.18)] transition-[border-color,box-shadow,background-color] duration-300 hover:border-white/[0.16] hover:shadow-[0_22px_50px_rgba(4,8,18,0.28)] rounded-[24px]"
    >
      <SpotlightCard className="flex h-full flex-col rounded-[inherit]">
        <div aria-hidden="true" className="shine-pass" />
        <Link href={product.href} className="block p-4 pb-0 z-10">
          <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-[20px] border border-white/[0.08] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),linear-gradient(180deg,rgba(14,18,29,0.96),rgba(8,11,18,0.45))] p-5">
            <div aria-hidden="true" className="vault-grid absolute inset-0 opacity-[0.05]" />
            <div aria-hidden="true" className="collector-vignette absolute inset-0 opacity-60" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,transparent_18%,rgba(128,226,221,0.05)_48%,rgba(255,255,255,0.08)_60%,transparent_84%)] opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
            <div aria-hidden="true" className="absolute inset-x-10 top-4 h-24 rounded-full bg-white/[0.05] blur-3xl transition-opacity duration-300 group-hover:opacity-100" />
            <div aria-hidden="true" className="absolute inset-x-8 bottom-3 h-8 rounded-full bg-primary/10 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
            <div aria-hidden="true" className="shine-pass" />
            {isDisabled ? (
              <div className="absolute inset-0 z-[2] flex items-center justify-center rounded-[inherit] bg-black/40 backdrop-blur-[2px]">
                <span className="rounded-full border border-destructive/30 bg-destructive/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive">
                  Agotado
                </span>
              </div>
            ) : null}
            <StoreMediaImage
              src={product.image}
              fallbackSrc="/mock/products/pokemon-etb.svg"
              alt={product.name}
              width={900}
              height={1100}
              sizes="(min-width: 1280px) 320px, (min-width: 768px) 42vw, 88vw"
              quality={78}
              className={cn(
                "relative mx-auto h-[85%] w-full object-contain transition-[transform,filter] duration-500 group-hover:scale-[1.03] group-hover:-translate-y-1 group-hover:brightness-110 group-hover:saturate-110",
                isDisabled && "saturate-[0.35] opacity-60",
              )}
            />
          </div>
        </Link>

        <div className="flex flex-1 flex-col p-5 z-10">
          <ProductCardBadgeRow
            items={[
              ...(isDisabled
                ? [
                    {
                      label: "Agotado",
                      variant: "destructive" as const,
                      className: "border-destructive/24 bg-destructive/10 text-destructive",
                    },
                  ]
                : []),
              ...(product.isPreorder
                ? [
                    {
                      label: product.badge ?? "Preventa",
                      variant: "default" as const,
                      className: "border-accent/24 bg-accent/10 text-accent",
                    },
                  ]
                : []),
            ]}
          />

          <Link href={product.href} className="mt-3 block min-h-[3.5rem]">
            <h3 className="line-clamp-2 font-heading text-[1.35rem] font-semibold leading-tight text-white transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>

          <p className="mt-2 line-clamp-2 min-h-[3rem] text-sm leading-6 text-slate-300">
            {product.description}
          </p>

          <div className="mt-4 grid gap-1.5 rounded-[16px] border border-white/[0.08] bg-white/[0.02] p-2.5 text-sm text-slate-300">
            {product.expansion ? (
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {product.expansion}
              </p>
            ) : null}
            <p className="text-sm text-slate-200/90">
              {product.stock > 0 ? `Stock: ${product.stock} uds` : "Sin stock"}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-white/[0.08] pt-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl font-semibold text-white">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice ? (
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                ) : null}
              </div>
            </div>

            <AddToCartButton
              productId={product.id}
              quantity={1}
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
              disabled={isDisabled}
              idleLabel={product.isPreorder ? "Reservar" : "Añadir"}
              addedLabel={product.isPreorder ? "Reservado" : "Añadido"}
              className={cn(
                "shrink-0 rounded-full shadow-[0_10px_26px_rgba(214,186,131,0.2)] transition-[transform,box-shadow,filter] duration-300 hover:scale-[1.01] hover:shadow-[0_14px_28px_rgba(214,186,131,0.24)]",
                product.isPreorder
                  ? "bg-[linear-gradient(180deg,rgba(128,226,221,0.9),rgba(90,200,196,0.9))] text-slate-950"
                  : "bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950",
              )}
            />
          </div>
        </div>
      </SpotlightCard>
    </motion.article>
  );
}
