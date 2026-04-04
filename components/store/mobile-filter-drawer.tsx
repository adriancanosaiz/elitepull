"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { FilterSidebar } from "@/components/store/filter-sidebar";
import { cn } from "@/lib/utils";
import type { CollectionResponse } from "@/types/contracts";

function getActiveFilterCount(collection: CollectionResponse) {
  const { query } = collection;
  return (
    query.brand.length +
    query.category.length +
    query.expansion.length +
    query.format.length +
    query.language.length +
    Number(query.inStock) +
    Number(query.isPreorder) +
    Number(query.featured) +
    Number(typeof query.priceMin === "number" || typeof query.priceMax === "number")
  );
}

export function MobileFilterDrawer({ collection }: { collection: CollectionResponse }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const activeCount = getActiveFilterCount(collection);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function clearFilters() {
    router.push(pathname, { scroll: false });
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "xl:hidden flex h-11 w-full items-center justify-between gap-3",
          "rounded-[20px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(15,19,29,0.94),rgba(9,12,19,0.92))]",
          "px-4 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(4,8,18,0.22)] active:opacity-80",
        )}
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className="inline-flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filtros</span>
          {activeCount > 0 && (
            <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
              {activeCount}
            </span>
          )}
        </span>
        <span className="text-[11px] font-normal text-slate-400">
          {activeCount > 0 ? `${activeCount} activos` : "Sin filtros"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="fixed inset-0 z-[60] bg-[rgba(3,6,14,0.74)] backdrop-blur-md xl:hidden"
              onClick={() => setOpen(false)}
            />

            <div className="fixed inset-0 z-[61] flex items-end xl:hidden">
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 340, damping: 38, mass: 0.88 }}
                className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-[30px] border-t border-white/[0.12] bg-[linear-gradient(180deg,rgba(12,16,26,0.995),rgba(7,9,16,0.995))] shadow-[0_-30px_80px_rgba(2,6,23,0.64)] backdrop-blur-2xl"
                style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_72%)]" />

                <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,16,26,0.98),rgba(12,16,26,0.92))] px-5 pb-4 pt-3 backdrop-blur-2xl">
                  <div className="flex justify-center">
                    <div className="h-1 w-10 rounded-full bg-white/20" />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Catálogo
                      </p>
                      <h2 className="mt-1 font-heading text-xl font-semibold text-white">
                        Filtros
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-400 active:opacity-60"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                    <span>{activeCount > 0 ? `${activeCount} filtros activos` : "Sin filtros activos"}</span>
                    <span>{collection.total} resultados</span>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                  <FilterSidebar
                    brands={collection.filters.brands}
                    categories={collection.filters.categories}
                    expansions={collection.filters.expansions}
                    formats={collection.filters.formats}
                    languages={collection.filters.languages}
                    price={collection.filters.price}
                    compact
                  />
                </div>

                <div className="border-t border-white/[0.08] bg-[linear-gradient(180deg,rgba(12,16,26,0.88),rgba(9,12,19,0.98))] px-4 pb-1 pt-3 backdrop-blur-2xl">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex h-12 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-white active:opacity-60"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,rgba(236,212,171,1),rgba(208,170,103,1))] px-4 text-sm font-semibold text-slate-950 shadow-[0_14px_32px_rgba(214,186,131,0.22)] active:opacity-90"
                    >
                      Ver {collection.total} resultados
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
