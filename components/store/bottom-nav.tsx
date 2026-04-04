"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronUp, Home, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { CartCheckoutButton } from "@/components/store/cart-checkout-button";
import { useCart } from "@/components/store/cart-provider";
import { MobileSearchModal } from "@/components/store/mobile-search-modal";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Inicio", icon: Home, key: "home" },
  { href: "/catalogo", label: "Catálogo", icon: LayoutGrid, key: "catalog" },
  { href: "#search", label: "Buscar", icon: Search, key: "search" },
  { href: "/carrito", label: "Carrito", icon: ShoppingBag, key: "cart" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { rawItems, summary } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const showCartCheckoutBar = pathname === "/carrito" && !summary.isEmpty;

  function isActive(key: string, href: string) {
    if (key === "search") return searchOpen;
    if (href === "/") return pathname === "/" && !searchOpen;
    return pathname.startsWith(href) && !searchOpen;
  }

  return (
    <>
      <MobileSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      <div className="fixed bottom-0 left-0 right-0 z-50 xl:hidden">
        {showCartCheckoutBar ? (
          <div className="relative z-[1]">
            <AnimatePresence initial={false}>
              {summaryExpanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  className="overflow-hidden border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,13,22,0.98),rgba(7,10,17,0.98))] backdrop-blur-2xl"
                >
                  <div className="space-y-2.5 px-4 pb-3 pt-4 text-sm">
                    <SummaryLine
                      label={`${summary.itemCount} producto${summary.itemCount !== 1 ? "s" : ""}`}
                      value={formatPrice(summary.subtotal)}
                    />
                    <SummaryLine
                      label="Envío"
                      value={summary.shipping === 0 ? "Gratis" : formatPrice(summary.shipping)}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,13,22,0.98),rgba(7,10,17,0.98))] px-4 py-3 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Total
                  </p>
                  <p className="font-heading text-lg font-semibold leading-tight text-white">
                    {formatPrice(summary.total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSummaryExpanded((prev) => !prev)}
                  className="ml-2 flex items-center gap-1 text-[11px] font-medium text-slate-400 transition-opacity active:opacity-60"
                >
                  <span>{summaryExpanded ? "Ocultar" : "Ver detalles"}</span>
                  <motion.div
                    animate={{ rotate: summaryExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </motion.div>
                </button>

                <div className="ml-auto w-32">
                  <CartCheckoutButton rawItems={rawItems} disabled={summary.isEmpty} />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9, delay: 0.3 }}
          aria-label="Navegación principal"
          className="relative"
          style={{ height: "calc(4.2rem + env(safe-area-inset-bottom))" }}
        >
          <div className="absolute inset-0 border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,11,18,0.88),rgba(5,8,13,0.97))] backdrop-blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div
            className="relative flex h-full items-stretch"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
          >
            {navItems.map((item) => {
              const active = isActive(item.key, item.href);
              const Icon = item.icon;
              const isCart = item.key === "cart";
              const isSearch = item.key === "search";
              const badgeCount = isCart ? summary.itemCount : 0;

              const handleClick = isSearch
                ? (e: React.MouseEvent) => {
                    e.preventDefault();
                    setSearchOpen((prev) => !prev);
                  }
                : undefined;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={handleClick}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    "relative flex flex-1 flex-col items-center justify-center gap-[3px] py-3",
                    "text-[10px] font-semibold uppercase tracking-[0.1em]",
                    "transition-colors duration-150 active:opacity-60",
                    active ? "text-primary" : "text-slate-500",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {active && (
                    <motion.span
                      layoutId="bottom-nav-glow"
                      className="absolute top-0 h-[2px] w-8 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}

                  <motion.span
                    className="relative inline-flex"
                    whileTap={{ scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 600, damping: 28 }}
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.3 : 1.6} />
                    {badgeCount > 0 && (
                      <motion.span
                        key={badgeCount}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="absolute -right-2.5 -top-2 inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-full border border-slate-950/40 bg-[linear-gradient(180deg,rgba(232,204,151,1),rgba(206,165,96,1))] px-1 text-[9px] font-bold text-slate-950 shadow-sm"
                      >
                        {badgeCount > 9 ? "9+" : badgeCount}
                      </motion.span>
                    )}
                  </motion.span>

                  <span className="leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      </div>
    </>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="text-white">{value}</span>
    </div>
  );
}
