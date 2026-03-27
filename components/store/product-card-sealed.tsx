"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/store/cart-provider";
import { StoreMediaImage } from "@/components/store/store-media-image";
import { formatPrice } from "@/lib/catalog";
import type { ProductCardItem } from "@/types/contracts";

export function ProductCardSealed({ product }: { product: ProductCardItem }) {
  const { addItem } = useCart();
  const isDisabled = product.stock < 1 && !product.isPreorder;

  return (
    <article className="surface-card group vault-sheen overflow-hidden transition-transform duration-300 hover:-translate-y-1.5">
      <Link href={product.href} className="block">
        <div className="relative overflow-hidden border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(14,18,29,0.9),rgba(8,11,18,0.2))] p-5">
          <div className="vault-grid absolute inset-0 opacity-[0.05]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_42%),linear-gradient(135deg,transparent_24%,rgba(128,226,221,0.06)_50%,transparent_78%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="absolute inset-x-8 bottom-3 h-8 rounded-full bg-primary/10 blur-2xl" />
          <StoreMediaImage
            src={product.image}
            fallbackSrc="/mock/products/pokemon-etb.svg"
            alt={product.name}
            width={900}
            height={1100}
            className="relative mx-auto h-[300px] w-auto object-contain transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="border-primary/16 bg-white/[0.05]">
            {product.brand.label}
          </Badge>
          <Badge variant="outline" className="border-white/10 bg-black/15">
            {product.category.label}
          </Badge>
          {product.isPreorder ? (
            <Badge className="border-accent/24 bg-accent/10 text-accent">
              {product.badge ?? "Preventa"}
            </Badge>
          ) : null}
        </div>

        <Link href={product.href} className="mt-4 block">
          <h3 className="font-heading text-[1.35rem] font-semibold leading-tight text-white transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-4 grid gap-2 text-sm text-slate-300">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
            {product.expansion ?? "Seleccion premium"}
          </p>
          <p className="text-sm text-slate-200/90">
            {product.stock > 0 ? `Stock: ${product.stock} unidades` : "Sin stock inmediato"}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/[0.08] pt-5">
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

          <Button
            size="sm"
            onClick={() => addItem(product.id, 1)}
            disabled={isDisabled}
            className="shrink-0 bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] text-slate-950 shadow-[0_10px_26px_rgba(214,186,131,0.22)]"
          >
            <ShoppingBag className="h-4 w-4" />
            {product.isPreorder ? "Reservar" : "Anadir"}
          </Button>
        </div>
      </div>
    </article>
  );
}
