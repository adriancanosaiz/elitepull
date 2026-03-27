"use client";

import { ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { sortOptions } from "@/lib/catalog";

export function SortBar({ resultCount }: { resultCount: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "featured";

  return (
    <div className="surface-soft flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-300">
        {resultCount} productos listos para explorar
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
