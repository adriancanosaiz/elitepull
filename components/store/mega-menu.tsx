"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

import { brands } from "@/data/brands";
import { brandMedia } from "@/data/brand-media";
import { brandPalettes } from "@/data/brand-palettes";
import { cn } from "@/lib/utils";

const primaryBrands = brands.filter(
  (brand) => !["accesorios", "preventa"].includes(brand.slug),
);

export function MegaMenu() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] hover:text-white",
          open && "border-white/10 bg-white/[0.05] text-white",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Marcas
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-1/2 top-full z-40 w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 pt-4"
          >
            <div className="surface-panel vault-sheen overflow-hidden p-4">
              <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Marcas principales
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Acceso rapido a cada universo TCG sin un mega menu gigante.
                  </p>
                </div>

                <Link
                  href="/catalogo"
                  onClick={() => setOpen(false)}
                  className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200 transition-colors hover:border-primary/18 hover:text-white sm:inline-flex"
                >
                  Ver catalogo
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {primaryBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className={cn(
                      "group relative overflow-hidden rounded-[24px] border border-primary/12 bg-[linear-gradient(180deg,rgba(13,18,29,0.92),rgba(8,11,19,0.94))] p-4",
                      brand.theme.glow,
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-28",
                        brand.theme.from,
                        brand.theme.via,
                        brand.theme.to,
                      )}
                    />
                    <div className="vault-grid absolute inset-0 opacity-[0.04]" />

                    <div className="relative">
                      <Link
                        href={brand.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          {brandMedia[brand.slug]?.logo ? (
                            <div
                              className="relative h-16 w-full max-w-[220px]"
                              style={{ filter: brandPalettes[brand.slug]?.logoShadow }}
                            >
                              <Image
                                src={brandMedia[brand.slug]!.logo!}
                                alt={`${brand.name} logo`}
                                fill
                                sizes="220px"
                                className="object-contain object-left"
                              />
                            </div>
                          ) : (
                            <h3 className="font-heading text-lg font-semibold text-white">
                              {brand.name}
                            </h3>
                          )}

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-300/82">
                            {brand.spotlight}
                          </p>
                        </div>

                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] border border-white/10 bg-black/20 text-white transition-transform group-hover:translate-x-0.5">
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {brand.categories.slice(0, 3).map((category) => (
                          <Link
                            key={category.id}
                            href={category.href}
                            onClick={() => setOpen(false)}
                            className="rounded-full border border-white/[0.08] bg-black/15 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-200 transition-colors hover:border-primary/18 hover:text-white"
                          >
                            {category.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-white/[0.08] pt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-primary/90" />
                Index compacto de marcas
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
