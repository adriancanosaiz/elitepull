"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";

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
  const activeCount = getActiveFilterCount(collection);

  return (
    <>
      {/* Trigger button — pill style */}
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

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm xl:hidden"
              onClick={() => setOpen(false)}
            />

            {/* Sheet panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36, mass: 0.85 }}
              className="fixed inset-x-0 bottom-0 z-[61] xl:hidden"
              style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
            >
              <div className="mx-2 mb-[76px] max-h-[80svh] overflow-hidden rounded-[24px] border border-white/[0.1] bg-[linear-gradient(180deg,rgba(12,16,26,0.99),rgba(7,9,16,0.99))] shadow-[0_-24px_64px_rgba(2,6,23,0.55)] backdrop-blur-2xl">
                {/* Handle */}
                <div className="flex justify-center pt-3">
                  <div className="h-1 w-10 rounded-full bg-white/20" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 pb-3 pt-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Catálogo
                    </p>
                    <h2 className="mt-1 font-heading text-lg font-semibold text-white">Filtros</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-400 active:opacity-60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Filter content */}
                <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: "calc(80svh - 100px)" }}>
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
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
