"use client";

import { SlidersHorizontal } from "lucide-react";

import { FilterSidebar } from "@/components/store/filter-sidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const activeCount = getActiveFilterCount(collection);

  return (
    <div className="xl:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full justify-between rounded-[22px] border-white/[0.1] bg-[linear-gradient(180deg,rgba(15,19,29,0.94),rgba(9,12,19,0.92))] px-4 text-white shadow-[0_18px_38px_rgba(4,8,18,0.18)]"
          >
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-primary">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <span className="text-left">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Catalogo
                </span>
                <span className="mt-1 block text-sm font-semibold text-white">
                  Abrir filtros
                </span>
              </span>
            </span>
            <span className="rounded-full border border-white/[0.08] bg-black/[0.22] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
              {activeCount > 0 ? `${activeCount} activos` : "Sin filtros"}
            </span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-full overflow-y-auto border-white/10 bg-[radial-gradient(circle_at_top,rgba(124,231,227,0.08),transparent_24%),linear-gradient(180deg,rgba(14,18,28,0.98),rgba(7,10,17,0.98))] sm:max-w-[30rem]"
        >
          <SheetHeader>
            <SheetTitle>Filtros del catalogo</SheetTitle>
            <SheetDescription>
              Ajusta marca, expansion, formato, idioma y disponibilidad sin salir de la vista.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
