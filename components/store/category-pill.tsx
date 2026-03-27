import Link from "next/link";

import { cn } from "@/lib/utils";

export function CategoryPill({
  label,
  href,
  active = false,
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-primary/[0.35] bg-primary/[0.15] text-primary"
          : "border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.08] hover:text-white",
      )}
    >
      {label}
    </Link>
  );
}
