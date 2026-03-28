"use client";

import Link from "next/link";
import { Minus, Plus, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/store/cart-provider";
import { formatPrice } from "@/lib/catalog";
import type { ProductDetail } from "@/types/contracts";

export function ProductInfo({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{product.brand.label}</Badge>
        <Badge variant="outline">{product.category.label}</Badge>
        {product.badge ? <Badge>{product.badge}</Badge> : null}
      </div>

      <div>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-white">
          {product.name}
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-300">{product.description}</p>
      </div>

      <div className="grid gap-3 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-300 md:grid-cols-2">
        {product.details.map((detail) => (
          <InfoLine key={detail.label} label={detail.label} value={detail.value} />
        ))}
      </div>

      <div className="surface-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-heading text-4xl font-semibold text-white">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice ? (
                <span className="text-lg text-slate-500 line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {product.isPreorder
                ? "Reserva abierta. El cobro se completa mediante Stripe Checkout."
                : product.stockLabel}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-white/10 bg-black/20">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="px-4 py-3 text-slate-200 transition-colors hover:text-white"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-10 text-center text-sm font-semibold text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((current) => current + 1)}
                className="px-4 py-3 text-slate-200 transition-colors hover:text-white"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="lg"
              onClick={() =>
                addItem(product.id, quantity, {
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
                })
              }
              disabled={product.stock < 1 && !product.isPreorder}
            >
              <ShoppingBag className="h-4 w-4" />
              {product.isPreorder ? "Reservar ahora" : "Anadir al carrito"}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
          <div className="rounded-[22px] border border-white/[0.08] bg-black/[0.15] p-4">
            <Truck className="mb-3 h-5 w-5 text-primary" />
            Envio rapido en peninsula y preparacion cuidada para producto de coleccion.
          </div>
          <div className="rounded-[22px] border border-white/[0.08] bg-black/[0.15] p-4">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            Checkout V1 activo con validacion server-side y pago en Stripe.
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white">Detalles</h2>
          <p className="mt-3">{product.description}</p>
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
      </div>
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
