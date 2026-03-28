"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Menu, Search, ShoppingBag, User2 } from "lucide-react";

import { BrandGlyph } from "@/components/store/brand-glyph";
import { brands } from "@/data/brands";
import { headerQuickLinks, mainNavigation } from "@/data/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { MegaMenu } from "@/components/store/mega-menu";
import { useCart } from "@/components/store/cart-provider";
import { SearchBar } from "@/components/store/search-bar";
import { SiteLogo } from "@/components/store/site-logo";
import { storefrontMotionEase } from "@/lib/storefront-motion";

export function Header() {
  const { totalItems, cartPulseKey } = useCart();
  const shouldReduceMotion = useReducedMotion();
  const cartIconControls = useAnimationControls();
  const cartBadgeControls = useAnimationControls();

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
    <header className="sticky top-0 z-50 pt-4">
      <div className="app-container">
        <div className="mb-3 hidden items-center justify-between rounded-[22px] border border-primary/15 bg-[linear-gradient(90deg,rgba(13,16,25,0.96),rgba(19,24,34,0.8),rgba(13,16,25,0.96))] px-4 py-2.5 text-[10px] uppercase tracking-[0.28em] text-slate-400 shadow-[0_12px_34px_rgba(2,6,23,0.18)] backdrop-blur-md md:flex">
          <span className="inline-flex items-center gap-3">
            <span className="pulse-signal h-1.5 w-1.5 rounded-full bg-primary/80" />
            ElitePull collector vault abierto
          </span>
          <div className="flex items-center gap-5">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent/80" />
              Stock real
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300/80" />
              Envio cuidado
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              Preventa activa
            </span>
          </div>
        </div>

        <div className="surface-panel vault-sheen overflow-visible border-primary/20 px-4 py-3 sm:px-5">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="collector-constellation pointer-events-none absolute inset-0 opacity-35" />
          <div className="flex items-center gap-3 xl:gap-4">
            <Link href="/" className="shrink-0">
              <SiteLogo />
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              <MegaMenu />

              {mainNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-transparent px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="hidden min-w-0 flex-1 xl:block">
              <SearchBar />
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="icon"
                className="hidden rounded-[18px] border-primary/15 bg-black/20 lg:inline-flex xl:hidden"
              >
                <Link href="/catalogo">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Buscar</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="icon"
                className="relative rounded-[18px] border-primary/15 bg-black/20"
              >
                <Link href="/carrito">
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
                </Link>
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="hidden rounded-[18px] border-primary/15 bg-black/20 sm:inline-flex"
              >
                <User2 className="h-4 w-4" />
                <span className="sr-only">Usuario</span>
              </Button>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-[18px] border-primary/15 bg-black/20 xl:hidden"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,231,227,0.08),transparent_24%),linear-gradient(180deg,rgba(14,18,28,0.98),rgba(7,10,17,0.98))]"
                >
                  <SheetHeader>
                    <SheetTitle>Navegacion ElitePull</SheetTitle>
                    <SheetDescription>
                      Explora catálogo, marcas y preventas desde un solo menú.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6">
                    <SearchBar compact />
                  </div>

                  <div className="mt-6 space-y-2">
                    {mainNavigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-[20px] border border-primary/12 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Marcas destacadas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {headerQuickLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-full border border-primary/14 bg-white/[0.03] px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-200"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {brands.map((brand) => (
                      <details
                        key={brand.id}
                        className="rounded-[24px] border border-primary/12 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      >
                        <summary className="flex cursor-pointer list-none items-center gap-3 font-heading text-lg font-semibold text-white">
                          <BrandGlyph brand={brand.slug} size="sm" />
                          {brand.name}
                        </summary>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {brand.tagline}
                        </p>
                        <div className="mt-4 grid gap-2">
                          {brand.categories.map((category) => (
                            <Link
                              key={category.id}
                              href={category.href}
                              className="rounded-[18px] border border-white/[0.08] bg-black/10 px-3 py-3 text-sm text-slate-100"
                            >
                              {category.label}
                            </Link>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
