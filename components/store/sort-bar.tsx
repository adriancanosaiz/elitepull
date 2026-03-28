"use client";

import { ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { sortOptions } from "@/lib/catalog";

export function SortBar({
  resultCount,
  page,
  pageSize,
  visibleCount,
}: {
  resultCount: number;
  page: number;
  pageSize: number;
  visibleCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "featured";
  const rangeStart = resultCount > 0 ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = resultCount > 0 ? rangeStart + visibleCount - 1 : 0;

  return (
    <div className="surface-soft flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-300">
        {resultCount > 0
          ? `Mostrando ${rangeStart}-${rangeEnd} de ${resultCount} productos`
          : "0 productos listos para explorar"}
      </p>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-2 text-sm text-slate-300">
          <ArrowUpDown className="h-4 w-4" />
          Ordenar por
        </span>
        <select
          value={currentSort}
          onChange={(event) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("sort", event.target.value);
            params.delete("page");
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
          }}
          className="h-11 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-950">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
