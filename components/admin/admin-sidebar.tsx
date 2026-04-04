"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ChevronDown,
  ChevronRight,
  Layers3,
  LayoutDashboard,
  PackageSearch,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import { useState } from "react";

import type { AuthProfile } from "@/lib/auth/admin";

const mainNavItems = [
  {
    href: "/admin",
    label: "Inicio",
    description: "Resumen y métricas",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/productos",
    label: "Productos",
    description: "Ver, crear y editar productos",
    icon: Boxes,
    exact: false,
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    description: "Pedidos recibidos en la tienda",
    icon: PackageSearch,
    exact: false,
  },
];

const catalogNavItems = [
  {
    href: "/admin/catalogo/marcas",
    label: "Marcas",
    description: "Pokémon, One Piece, Magic…",
    icon: Tags,
  },
  {
    href: "/admin/catalogo/expansiones",
    label: "Expansiones",
    description: "Sets dentro de cada marca",
    icon: Layers3,
  },
  {
    href: "/admin/catalogo/formatos",
    label: "Formatos",
    description: "Booster Pack, ETB, Bundle…",
    icon: Boxes,
  },
  {
    href: "/admin/catalogo/configuracion",
    label: "Configuración",
    description: "Qué formatos tiene cada expansión",
    icon: SlidersHorizontal,
  },
];

export function AdminSidebar({ profile }: { profile: AuthProfile }) {
  const pathname = usePathname();
  const [catalogOpen, setCatalogOpen] = useState(
    pathname.startsWith("/admin/catalogo"),
  );

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="surface-panel flex h-full flex-col p-5 md:p-6">
      {/* Branding */}
      <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
          ElitePull
        </p>
        <p className="mt-2 font-heading text-xl font-semibold text-white">
          Panel de administración
        </p>
      </div>

      {/* Sesión */}
      <div className="mt-4 rounded-[26px] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-sm font-bold text-amber-200">
            {(profile.full_name ?? profile.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {profile.full_name ?? profile.email}
            </p>
            <p className="mt-0.5 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
              {profile.role === "admin" ? "Administrador" : profile.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navegación principal */}
      <nav className="mt-5 flex-1 space-y-1.5">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Tienda
        </p>
        {mainNavItems.map(({ href, label, description, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "group flex items-center gap-3 rounded-[20px] border px-4 py-3 transition-all duration-200",
                active
                  ? "border-amber-400/25 bg-amber-400/8 text-amber-100"
                  : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.05]",
              ].join(" ")}
            >
              <span
                className={[
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                  active
                    ? "border-amber-400/30 bg-amber-400/12 text-amber-200"
                    : "border-white/10 bg-black/25 text-slate-400 group-hover:text-amber-200",
                ].join(" ")}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm font-semibold ${active ? "text-amber-100" : "text-white"}`}>
                  {label}
                </span>
                <span className="block truncate text-xs text-slate-500">{description}</span>
              </span>
            </Link>
          );
        })}

        {/* Catálogo colapsable */}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setCatalogOpen((v) => !v)}
            className="flex w-full items-center justify-between px-1 py-1"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Catálogo
            </p>
            {catalogOpen ? (
              <ChevronDown className="h-3 w-3 text-slate-500" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-500" />
            )}
          </button>

          {catalogOpen && (
            <div className="mt-1.5 space-y-1.5">
              <p className="px-1 pb-1 text-[10px] text-slate-600">
                Configura el catálogo antes de crear productos
              </p>
              {catalogNavItems.map(({ href, label, description, icon: Icon }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "group flex items-center gap-3 rounded-[20px] border px-4 py-3 transition-all duration-200",
                      active
                        ? "border-amber-400/25 bg-amber-400/8"
                        : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.05]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                        active
                          ? "border-amber-400/30 bg-amber-400/12 text-amber-200"
                          : "border-white/10 bg-black/25 text-slate-500 group-hover:text-amber-200",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-semibold ${active ? "text-amber-100" : "text-white"}`}>
                        {label}
                      </span>
                      <span className="block truncate text-xs text-slate-500">{description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
