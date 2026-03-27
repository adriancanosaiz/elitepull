import type { ReactNode } from "react";

import { logoutAction } from "@/app/login/actions";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import type { AuthProfile } from "@/lib/auth/admin";

export function AdminShell({
  profile,
  children,
}: {
  profile: AuthProfile;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(124,231,227,0.06),transparent_20%),linear-gradient(180deg,#05070d_0%,#0a0f17_36%,#070b12_100%)] px-4 py-4 md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[6%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-10%] top-[18%] h-[360px] w-[360px] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-0 subtle-grid opacity-15" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <AdminSidebar profile={profile} />

        <div className="surface-panel flex min-h-full flex-col p-5 md:p-6">
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-black/20 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Dashboard V1
              </p>
              <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
                Control operativo y editorial
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                Panel inicial preparado para crecer hacia catalogo, media, pedidos y clientes sin
                rehacer autenticacion ni proteccion de rutas.
              </p>
            </div>

            <form action={logoutAction}>
              <Button type="submit" variant="outline" size="lg">
                Cerrar sesion
              </Button>
            </form>
          </div>

          <div className="mt-6 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
