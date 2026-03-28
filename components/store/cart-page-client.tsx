"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { CartCheckoutButton } from "@/components/store/cart-checkout-button";
import { useCart } from "@/components/store/cart-provider";
import { EmptyState } from "@/components/store/empty-state";
import { formatPrice } from "@/lib/catalog";

export function CartPageClient() {
  const { rawItems, items, summary, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [customerEmail, setCustomerEmail] = useState("");

  return (
    <section className="app-container pb-8 pt-8 md:pt-10">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Carrito" },
        ]}
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow-label">Carrito</span>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Tu seleccion actual
          </h1>
          <p className="mt-3 text-base leading-8 text-slate-300">
            {summary.itemCount} items preparados para pasar a Stripe Checkout.
          </p>
        </div>

        {!summary.isEmpty ? (
          <Button variant="ghost" onClick={clearCart}>
            Vaciar carrito
          </Button>
        ) : null}
      </div>

      {summary.isEmpty ? (
        <EmptyState
          className="mt-8 min-h-[380px]"
          icon={ShoppingBag}
          title="Tu carrito esta vacio"
          description="Puedes empezar por novedades, preventa o singles destacados para rellenarlo."
          action={{ label: "Explorar catalogo", href: "/catalogo" }}
        />
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.productId}
                className="surface-card flex flex-col gap-5 p-5 md:flex-row"
              >
                <Link
                  href={item.href}
                  className="relative flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-3 md:w-36"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={320}
                    height={420}
                    className="h-full w-full object-contain"
                  />
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-xl">
                      <Link href={item.href}>
                        <h2 className="font-heading text-2xl font-semibold text-white">
                          {item.name}
                        </h2>
                      </Link>
                      <p className="mt-2 text-sm text-slate-300">
                        {item.expansion ?? item.brandLabel}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        {item.description}
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="font-heading text-2xl font-semibold text-white">
                        {formatPrice(item.lineTotal)}
                      </p>
                      <p className="mt-2 text-sm text-slate-400">
                        {formatPrice(item.unitPrice)} unidad
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center rounded-full border border-white/10 bg-black/[0.15]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                        }
                        className="px-4 py-3 text-slate-200 transition-colors hover:text-white"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="px-4 py-3 text-slate-200 transition-colors hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                      Quitar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="surface-card h-fit p-6 xl:sticky xl:top-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Resumen
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
              Pedido V1
            </h2>

            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <SummaryLine label="Subtotal" value={formatPrice(subtotal)} />
              <SummaryLine
                label="Envio"
                value={summary.shipping === 0 ? "Gratis" : formatPrice(summary.shipping)}
              />
              <SummaryLine label="Total" value={formatPrice(summary.total)} strong />
            </div>

            <div className="mt-6 space-y-3">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email de compra
                </span>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  placeholder="tu@email.com"
                  className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                />
              </label>

              <CartCheckoutButton
                rawItems={rawItems}
                customerEmail={customerEmail}
                disabled={summary.isEmpty}
              />
            </div>
            <Button asChild variant="outline" className="mt-3 w-full" size="lg">
              <Link href="/catalogo">Seguir comprando</Link>
            </Button>

            <p className="mt-4 text-xs leading-6 text-slate-400">
              El total final y la disponibilidad se recalculan en servidor antes de abrir Stripe.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

function SummaryLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={strong ? "font-heading text-xl font-semibold text-white" : "text-white"}>
        {value}
      </span>
    </div>
  );
}
