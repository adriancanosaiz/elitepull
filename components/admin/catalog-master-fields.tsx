import type { ComponentProps, ComponentPropsWithoutRef, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";

const selectClassName =
  "flex h-11 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/90 [color-scheme:dark] px-4 pr-11 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors duration-200 focus-visible:border-primary/40 focus-visible:bg-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

export function AdminCatalogPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
        {eyebrow ?? "Catálogo"}
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold text-white">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{description}</p>
    </section>
  );
}

export function AdminCatalogNotice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: string;
}) {
  return (
    <div
      className={[
        "rounded-[24px] border px-4 py-3 text-sm leading-6",
        tone === "error"
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function AdminCatalogField({
  label,
  name,
  hint,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  name: string;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <Input name={name} {...props} />
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

export function AdminCatalogSelectField({
  label,
  name,
  options,
  placeholder,
  hint,
  ...props
}: ComponentPropsWithoutRef<"select"> & {
  label: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <AdminCatalogNativeSelect name={name} {...props}>
        {placeholder ? (
          <option value="" className="bg-slate-950 text-white">
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950 text-white">
            {option.label}
          </option>
        ))}
      </AdminCatalogNativeSelect>
      {hint ? <p className="text-xs leading-5 text-slate-500">{hint}</p> : null}
    </label>
  );
}

export function AdminCatalogNativeSelect({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <div className="relative">
      <select className={[selectClassName, className].filter(Boolean).join(" ")} {...props}>
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

export function AdminCatalogCheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-white/20 bg-transparent accent-[var(--color-primary)]"
      />
      <span className="text-sm font-medium text-white">{label}</span>
    </label>
  );
}

export function AdminCatalogSection({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {eyebrow}
      </p>
      {children}
    </section>
  );
}
