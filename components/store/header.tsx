"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

import { CartDrawer } from "@/components/store/cart-drawer";
import { mainNavigation } from "@/data/site";
import { Button } from "@/components/ui/button";
import { MegaMenu } from "@/components/store/mega-menu";
import { useCart } from "@/components/store/cart-provider";
import { SiteLogo } from "@/components/store/site-logo";
import { storefrontMotionEase } from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";

const SearchBar = dynamic(
  () => import("@/components/store/search-bar").then((module) => module.SearchBar),
  {
    ssr: false,
    loading: () => (
      <div className="h-12 rounded-[22px] border border-primary/15 bg-[linear-gradient(180deg,rgba(18,22,32,0.92),rgba(10,13,20,0.85))] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
    ),
  },
);

export function Header() {
  const { totalItems, cartPulseKey } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const cartIconControls = useAnimationControls();
  const cartBadgeControls = useAnimationControls();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  useEffect(() => {
    if (shouldReduceMotion || cartPulseKey < 1) {
      return;
    }

    void cartIconControls.start({
      scale: [1, 1.12, 0.97, 1],
      y: [0, -2, 0],
      rotate: [0, -6, 4, 0],
      transition: { duration: 0.58, ease: storefrontMotionEase },
    });

    void cartBadgeControls.start({
      scale: [1, 1.22, 0.96, 1],
      transition: { duration: 0.54, ease: storefrontMotionEase },
    });
  }, [cartBadgeControls, cartIconControls, cartPulseKey, shouldReduceMotion]);

  return (
    <header className="sticky top-0 z-50 pt-1.5 sm:pt-3 md:pt-4">
      <div className="app-container">
        {/* Top info bar — desktop only */}
        <div className="mb-3 hidden items-center justify-between rounded-[22px] border border-primary/15 bg-[linear-gradient(90deg,rgba(13,16,25,0.96),rgba(19,24,34,0.8),rgba(13,16,25,0.96))] px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] text-slate-400 shadow-[0_12px_34px_rgba(2,6,23,0.18)] backdrop-blur-md md:flex">
          <span className="inline-flex items-center gap-3">
            <span aria-hidden="true" className="pulse-signal h-1.5 w-1.5 rounded-full bg-primary/80" />
            Envío en 24-48h laborables
          </span>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent/80" />
              Stock en tiempo real
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-300/80" />
              Pago seguro con Stripe
            </span>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/70" />
              Preventas abiertas
            </span>
          </div>
        </div>

        {/* Main header bar */}
        <div className={cn(
            "surface-panel vault-sheen flex items-center overflow-visible border-primary/20 px-3 sm:px-5",
            scrolled ? "h-12 sm:h-14 xl:h-20" : "h-12 sm:h-16 xl:h-20",
            "transition-[height] duration-300",
          )}>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div aria-hidden="true" className="collector-constellation pointer-events-none absolute inset-0 opacity-35" />
          <div className="flex w-full items-center gap-2.5 sm:gap-3 xl:gap-4">
            <Link href="/" className="min-w-0 shrink-0">
              <SiteLogo compact className="max-w-[152px] sm:max-w-none" />
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              <MegaMenu />

              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full border border-transparent px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
                    isActive(item.href)
                      ? "border-primary/20 bg-primary/[0.08] text-primary"
                      : "text-slate-300",
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden min-w-0 flex-1 xl:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {/* Cart button — desktop only; mobile uses BottomNav */}
              <div className="hidden xl:flex">
                <CartDrawer>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative rounded-[20px] border-primary/15 bg-black/20"
                  >
                    <motion.span animate={cartIconControls} className="inline-flex">
                      <ShoppingBag className="h-4 w-4" />
                    </motion.span>
                    <span className="sr-only">Carrito</span>
                    <motion.span
                      animate={cartBadgeControls}
                      className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(232,204,151,1),rgba(206,165,96,1))] px-1 text-[10px] font-bold text-slate-950 shadow-[0_8px_18px_rgba(221,184,120,0.28)]"
                    >
                      {totalItems}
                    </motion.span>
                  </Button>
                </CartDrawer>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
