"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { storefrontCardTransition } from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";

function buildVisiblePages(currentPage: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1) as Array<number | string>;
  }

  const pages = new Set<number>([1, 2, currentPage - 1, currentPage, currentPage + 1, pageCount - 1, pageCount]);
  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);
  const items: Array<number | string> = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}-${page}`);
    }

    items.push(page);
  });

  return items;
}

function buildPaginationHref(
  pathname: string,
  currentSearchParams: URLSearchParams,
  nextPage: number,
) {
  const params = new URLSearchParams(currentSearchParams.toString());

  if (nextPage <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(nextPage));
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function CollectionPagination({
  currentPage,
  pageCount,
}: {
  currentPage: number;
  pageCount: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();

  if (pageCount <= 1) {
    return null;
  }

  const pages = buildVisiblePages(currentPage, pageCount);
  const containerClassName =
    "surface-soft overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] px-4 py-4 shadow-[0_14px_40px_rgba(4,8,18,0.18)]";
  const previousHref = buildPaginationHref(pathname, searchParams, currentPage - 1);
  const nextHref = buildPaginationHref(pathname, searchParams, currentPage + 1);

  const content = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          Navegacion del listado
        </p>
        <p className="text-sm text-slate-300">
          Pagina <span className="text-white">{currentPage}</span> de{" "}
          <span className="text-white">{pageCount}</span>
        </p>
      </div>

      <nav
        aria-label="Paginacion del catalogo"
        className="flex flex-wrap items-center gap-2"
      >
        {currentPage > 1 ? (
          <Button asChild variant="outline" size="sm" className="rounded-full border-white/[0.12] bg-black/[0.16]">
            <Link href={previousHref}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/[0.08] bg-white/[0.02] text-slate-500 opacity-60"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
        )}

        {pages.map((page, index) => {
          if (typeof page === "string") {
            return (
              <span
                key={page}
                className="px-1 text-sm text-slate-500"
                aria-hidden="true"
              >
                ...
              </span>
            );
          }

          return (
            <Link
              key={`${page}-${index}`}
              href={buildPaginationHref(pathname, searchParams, page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-11 min-w-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium transition-[border-color,background-color,color,box-shadow] duration-300",
                page === currentPage
                  ? "border-amber-300/35 bg-[linear-gradient(180deg,rgba(245,199,112,0.22),rgba(245,199,112,0.09))] text-amber-50 shadow-[0_12px_24px_rgba(245,199,112,0.16)]"
                  : "border-white/[0.1] bg-black/[0.18] text-slate-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white",
              )}
            >
              {page}
            </Link>
          );
        })}

        {currentPage < pageCount ? (
          <Button asChild variant="outline" size="sm" className="rounded-full border-white/[0.12] bg-black/[0.16]">
            <Link href={nextHref}>
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/[0.08] bg-white/[0.02] text-slate-500 opacity-60"
            disabled
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </nav>
    </div>
  );

  if (shouldReduceMotion) {
    return <div className={containerClassName}>{content}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={storefrontCardTransition}
      className={containerClassName}
    >
      {content}
    </motion.div>
  );
}
