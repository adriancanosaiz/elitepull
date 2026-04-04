"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/store/breadcrumbs";
import { CartCheckoutButton } from "@/components/store/cart-checkout-button";
import { useCart } from "@/components/store/cart-provider";
import { EmptyState } from "@/components/store/empty-state";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function CartPageClient() {
  const { rawItems, items, summary, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [customerEmail, setCustomerEmail] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  function handleClearCart() {
    clearCart();
    setShowClearConfirm(false);
  }

  return (
    <>
      <section className="app-container pb-[152px] pt-6 sm:pb-8 sm:pt-8 md:pt-10 xl:pb-8">
        {/* Breadcrumbs — desktop only */}
        <div className="hidden sm:block">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Carrito" },
            ]}
          />
        </div>

        <div className="mt-2 flex items-end justify-between gap-3 sm:mt-6">
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
              Carrito
            </h1>
            <p className="mt-1 text-xs text-slate-400 sm:mt-3 sm:text-base sm:leading-8 sm:text-slate-300">
              {summary.itemCount}{" "}
              {summary.itemCount === 1 ? "producto" : "productos"}
            </p>
          </div>

          {!summary.isEmpty ? (
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(true)} className="text-xs sm:text-sm">
                Vaciar
              </Button>
              <AnimatePresence>
                {showClearConfirm ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full z-20 mt-2 rounded-[20px] border border-destructive/20 bg-[linear-gradient(180deg,rgba(14,18,28,0.98),rgba(8,11,18,0.98))] p-4 shadow-[0_20px_48px_rgba(2,6,23,0.4)] backdrop-blur-xl"
                  >
                    <p className="text-sm font-medium text-white">¿Vaciar todo?</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowClearConfirm(false)}>
                        No
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleClearCart}
                        className="bg-destructive text-white hover:bg-destructive/90"
                      >
                        Sí
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : null}
        </div>

        {summary.isEmpty ? (
          <EmptyState
            className="mt-8 min-h-[320px]"
            icon={ShoppingBag}
            title="Tu carrito está vacío"
            description="Explora el catálogo para añadir productos."
            action={{ label: "Explorar catálogo", href: "/catalogo" }}
          />
        ) : (
          <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_360px] sm:mt-6">
            {/* Items list — always first */}
            <div className="space-y-3 xl:order-1">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.article
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -40, scale: 0.95 }}
                    transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                    className="surface-card flex gap-3 p-3 sm:gap-5 sm:p-5"
                  >
                    <Link
                      href={item.href}
                      className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-1.5 sm:h-24 sm:w-24 sm:rounded-[20px] sm:p-2"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={320}
                        height={420}
                        className="h-full w-full object-contain"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between gap-2 sm:gap-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <Link href={item.href}>
                            <h2 className="line-clamp-1 font-heading text-sm font-semibold text-white sm:text-lg">
                              {item.name}
                            </h2>
                          </Link>
                          <p className="mt-0.5 text-[11px] text-slate-400 sm:text-sm">
                            {item.expansion ?? item.brandLabel}
                          </p>
                        </div>

                        <p className="shrink-0 font-heading text-base font-semibold text-white sm:text-xl">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div
                          className="flex items-center rounded-full border border-white/10 bg-black/[0.15]"
                          role="group"
                          aria-label="Cantidad"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, Math.max(1, item.quantity - 1))
                            }
                            className="px-3 py-2 text-slate-200 active:opacity-60 sm:px-4 sm:py-3"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-7 text-center text-xs font-semibold text-white sm:min-w-10 sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-2 text-slate-200 active:opacity-60 sm:px-4 sm:py-3"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors active:opacity-60 sm:text-sm sm:text-slate-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Quitar</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Desktop sidebar — hidden on mobile (sticky bottom bar replaces it) */}
            <aside className="hidden surface-card h-fit p-6 xl:order-2 xl:sticky xl:top-28 xl:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Resumen
              </p>
              <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
                Resumen del pedido
              </h2>

              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <SummaryLine label="Subtotal" value={formatPrice(subtotal)} />
                <SummaryLine
                  label="Envío"
                  value={summary.shipping === 0 ? "Gratis" : formatPrice(summary.shipping)}
                />
                <SummaryLine label="Total" value={formatPrice(summary.total)} strong />
              </div>

              <div className="mt-6 space-y-3">
                <label className="block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Email para la confirmación
                  </span>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(event) => setCustomerEmail(event.target.value)}
                    placeholder="tu@email.com"
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
                El total y la disponibilidad se verifican antes de abrir Stripe.
              </p>
            </aside>
          </div>
        )}
      </section>

    </>
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
      <span className="text-slate-400">{label}</span>
      <span className={strong ? "font-heading text-base font-semibold text-white sm:text-xl" : "text-white"}>
        {value}
      </span>
    </div>
  );
}
