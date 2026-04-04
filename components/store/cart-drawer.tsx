"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/components/store/cart-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/catalog";
import { storefrontMotionEase } from "@/lib/storefront-motion";

export function CartDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { items, summary, subtotal, updateQuantity, removeItem } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col overflow-hidden border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,231,227,0.08),transparent_24%),linear-gradient(180deg,rgba(14,18,28,0.98),rgba(7,10,17,0.98))] p-0 sm:max-w-md">
        <SheetHeader className="border-b border-white/[0.08] px-6 py-4 text-left">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="font-heading text-lg">Tu Carrito ({summary.itemCount})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {summary.isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <ShoppingBag className="h-6 w-6 text-slate-500" />
              </div>
              <h3 className="mt-4 font-heading text-xl font-semibold text-white">
                Tu carrito está vacío
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                Parece que aún no has añadido nada.
              </p>
              <Button
                variant="outline"
                className="mt-6 border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => setOpen(false)}
              >
                Seguir explorando
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <AnimatePresence mode="popLayout" initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout="position"
                    initial={{ opacity: 0, scale: 0.96, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: -20 }}
                    transition={{ duration: 0.28, ease: storefrontMotionEase }}
                    className="group relative flex gap-4 rounded-2xl border border-white/[0.06] bg-black/20 p-3 transition-colors hover:border-white/[0.12] hover:bg-black/40"
                  >
                    <div className="relative flex h-20 w-16 shrink-0 items-center justify-center rounded-xl bg-white/[0.03]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={80}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="pr-6">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="line-clamp-1 text-sm font-semibold text-white transition-colors hover:text-primary"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-slate-400">{formatPrice(item.unitPrice)}</p>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex h-8 items-center rounded-full border border-white/10 bg-black/40">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                            className="flex h-full w-8 items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-full w-8 items-center justify-center text-slate-400 hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <p className="font-heading text-sm font-semibold text-primary">
                          {formatPrice(item.lineTotal)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="absolute right-3 top-3 text-slate-500 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                      aria-label="Eliminar item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {!summary.isEmpty && (
          <div className="border-t border-white/[0.08] bg-black/20 p-6 backdrop-blur-xl">
            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between font-heading text-lg font-semibold text-white">
                <span>Total estimado</span>
                <span className="text-primary">{formatPrice(summary.total)}</span>
              </div>
              <p className="text-xs text-slate-400">
                Impuestos incluidos. Envío calculado en el checkout.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Button asChild onClick={() => setOpen(false)} className="w-full">
                <Link href="/carrito">Tramitar pedido</Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
