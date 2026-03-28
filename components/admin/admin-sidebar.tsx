import Link from "next/link";
import {
  Boxes,
  FolderKanban,
  LayoutDashboard,
  PackageSearch,
  Users,
} from "lucide-react";

import type { AuthProfile } from "@/lib/auth/admin";

const adminNavItems = [
  {
    href: "/admin",
    label: "Dashboard",
    description: "Vista general",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/productos",
    label: "Productos",
    description: "Catalogo y stock",
    icon: Boxes,
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    description: "Listado y detalle",
    icon: PackageSearch,
  },
  {
    href: "/admin#clientes",
    label: "Clientes",
    description: "Profiles y acceso",
    icon: Users,
  },
  {
    href: "/admin#media-catalogo",
    label: "Media / catalogo",
    description: "Uploads y seeds",
    icon: FolderKanban,
  },
];

export function AdminSidebar({ profile }: { profile: AuthProfile }) {
  return (
    <aside className="surface-panel flex h-full flex-col p-5 md:p-6">
      <div className="rounded-[26px] border border-white/10 bg-black/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
          ElitePull Admin
        </p>
        <p className="mt-3 font-heading text-2xl font-semibold text-white">
          Operativa interna
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Base V1 para catalogo, media y gestion de equipo sin sobreingenieria.
        </p>
      </div>

      <div className="mt-5 rounded-[26px] border border-white/10 bg-black/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Sesion actual
        </p>
        <p className="mt-3 text-sm font-semibold text-white">
          {profile.full_name || profile.email}
        </p>
        <p className="mt-1 text-sm text-slate-400">{profile.email}</p>
        <p className="mt-3 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100">
          {profile.role}
        </p>
      </div>

      <nav className="mt-6 space-y-2">
        {adminNavItems.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.02] px-4 py-3 transition-all duration-200 hover:border-white/14 hover:bg-white/[0.05]"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-amber-200">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-white">{label}</span>
              <span className="block text-xs text-slate-400">{description}</span>
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
