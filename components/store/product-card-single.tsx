"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/catalog";
import type { ProductCardItem } from "@/types/contracts";

export function ProductCardSingle({ product }: { product: ProductCardItem }) {
  const { addItem } = useCart();
  const isDisabled = product.stock < 1 && !product.isPreorder;

  return (
    <article className="surface-card group vault-sheen overflow-hidden transition-transform duration-300 hover:-translate-y-1.5">
      <Link href={product.href} className="block p-4">
        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,12,19,0.9),rgba(16,20,30,0.4))] p-3">
          <div className="absolute inset-0 bg-[linear-gradient(130deg,transparent_18%,rgba(128,226,221,0.08)_46%,rgba(255,255,255,0.06)_58%,transparent_84%)] opacity-60" />
          <Image
            src={product.image}
            alt={product.name}
            width={750}
            height={1050}
            className="relative h-[330px] w-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="p-5 pt-0">
        <div className="flex flex-wrap gap-2">
          {product.badge ? (
            <Badge className="border-accent/24 bg-accent/10 text-accent">{product.badge}</Badge>
          ) : null}
          {product.rarity ? (
            <Badge variant="secondary" className="border-primary/16 bg-white/[0.05]">
              {product.rarity}
            </Badge>
          ) : null}
          {product.language ? (
            <Badge variant="outline" className="border-white/10 bg-black/15">
              {product.language}
            </Badge>
          ) : null}
        </div>

        <Link href={product.href} className="mt-4 block">
          <h3 className="font-heading text-[1.35rem] font-semibold leading-tight text-white transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {product.expansion ?? "Single premium"}
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {product.condition ?? "NM"}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.08] pt-5">
          <span className="font-heading text-2xl font-semibold text-white">
            {formatPrice(product.price)}
          </span>

          <Button
            size="sm"
            onClick={() => addItem(product.id, 1)}
            disabled={isDisabled}
            className="bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950 shadow-[0_10px_26px_rgba(214,186,131,0.22)]"
          >
            <ShoppingBag className="h-4 w-4" />
            {product.isPreorder ? "Reservar" : "Anadir"}
          </Button>
        </div>
      </div>
    </article>
  );
}
