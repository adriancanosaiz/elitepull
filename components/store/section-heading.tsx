import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-300">
            <span className="signal-line pulse-signal h-px w-10" />
            <span>{eyebrow}</span>
          </div>
        ) : null}
        <h2 className="mt-4 section-title">{title}</h2>
        {description ? (
          <p className="mt-4 max-w-[58ch] text-sm leading-7 text-slate-300 md:text-base md:leading-8">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-200 transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.06] hover:text-white"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
