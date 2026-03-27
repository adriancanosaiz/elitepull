import Link from "next/link";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";

import { loginAction, logoutAction } from "@/app/login/actions";
import { canAccessAdmin, getCurrentSessionProfile } from "@/lib/auth/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginSearchParams = Promise<{
  error?: string;
  notice?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  const params = await searchParams;
  const { user, profile } = await getCurrentSessionProfile();
  const hasAdminAccess = canAccessAdmin(profile?.role ?? null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(124,231,227,0.08),transparent_18%),linear-gradient(180deg,#070b12_0%,#0b1018_38%,#070b12_100%)] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[10%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-8%] top-[12%] h-[320px] w-[320px] rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute inset-0 subtle-grid opacity-20" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-panel p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/70">
              Acceso interno
            </p>
            <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-white md:text-5xl">
              Accede al panel operativo de ElitePull
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
              Esta pantalla esta pensada para el equipo. La autenticacion usa Supabase Auth con
              sesion SSR y control de acceso por rol en `profiles`.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <VaultStat
                icon={ShieldCheck}
                label="SSR session"
                value="Cookies vivas"
              />
              <VaultStat
                icon={LockKeyhole}
                label="Roles"
                value="admin / staff"
              />
              <VaultStat
                icon={KeyRound}
                label="Provision"
                value="Manual V1"
              />
            </div>

            <div className="mt-10 rounded-[30px] border border-white/10 bg-black/20 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Flujo recomendado
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <li>1. Crear el usuario en Supabase Auth.</li>
                <li>2. Promocionarlo en `profiles.role` a `admin` o `staff`.</li>
                <li>3. Iniciar sesion aqui y entrar al area `/admin`.</li>
              </ol>
            </div>
          </section>

          <section className="surface-panel p-8 md:p-10">
            {!user ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Login V1
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold text-white">
                  Email y contrasena
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  No hay registro publico de momento. Los accesos administrativos se provisionan
                  manualmente.
                </p>

                {params.error ? (
                  <AlertTone tone="error">{params.error}</AlertTone>
                ) : null}

                {params.notice ? (
                  <AlertTone tone="notice">{params.notice}</AlertTone>
                ) : null}

                <form action={loginAction} className="mt-8 space-y-5">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Email
                    </span>
                    <Input
                      name="email"
                      type="email"
                      placeholder="admin@elitepull.es"
                      autoComplete="email"
                      required
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Contrasena
                    </span>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Tu contrasena"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  <Button type="submit" size="lg" className="w-full">
                    Iniciar sesion
                  </Button>
                </form>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Sesion activa
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold text-white">
                  {profile?.full_name || profile?.email || user.email}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Ya tienes una sesion iniciada. Desde aqui puedes ir al admin si tu rol lo
                  permite o cerrar sesion.
                </p>

                <div className="mt-8 space-y-3 rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-400">Email:</span>{" "}
                    <span className="text-white">{profile?.email || user.email}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Role:</span>{" "}
                    <span className="text-white">{profile?.role || "sin-profile"}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Acceso admin:</span>{" "}
                    <span className="text-white">{hasAdminAccess ? "Permitido" : "Denegado"}</span>
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {hasAdminAccess ? (
                    <Button asChild size="lg">
                      <Link href="/admin">Ir al admin</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="lg">
                      <Link href="/">Volver al storefront</Link>
                    </Button>
                  )}

                  <form action={logoutAction}>
                    <Button type="submit" variant="outline" size="lg" className="w-full sm:w-auto">
                      Cerrar sesion
                    </Button>
                  </form>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function AlertTone({
  children,
  tone,
}: {
  children: string;
  tone: "error" | "notice";
}) {
  return (
    <div
      className={[
        "mt-6 rounded-[24px] border px-4 py-3 text-sm leading-6",
        tone === "error"
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function VaultStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <Icon className="h-5 w-5 text-amber-200" />
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}
