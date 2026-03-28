import Link from "next/link";
import { ArrowRight, BadgeCheck, MessageSquareMore, ShieldCheck, Truck } from "lucide-react";

import { benefits, footerLinkGroups } from "@/data/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SiteLogo } from "@/components/store/site-logo";

const benefitIcons = {
  shipping: Truck,
  stock: BadgeCheck,
  secure: ShieldCheck,
  support: MessageSquareMore,
} as const;

export function Footer() {
  return (
    <footer className="pb-8 pt-16">
      <div className="app-container">
        <div className="surface-panel overflow-hidden px-6 py-8 sm:px-8 sm:py-10">
          <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="eyebrow-label">Universe built for collectors</span>
              <div className="mt-5 max-w-2xl">
                <Link href="/" className="inline-flex">
                  <SiteLogo />
                </Link>
                <h2 className="mt-6 font-heading text-3xl font-semibold tracking-tight text-white md:text-4xl">
                  Una base visual lista para escalar a catalogo real sin rehacer el frontend.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                  La tienda ya nace con tono premium, jerarquia clara y componentes pensados
                  para operar un primer lanzamiento real con catalogo, admin y checkout.
                </p>
              </div>
            </div>

            <div className="surface-card p-5 sm:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                Acceso prioritario
              </p>
              <h3 className="mt-3 font-heading text-2xl font-semibold text-white">
                Newsletter visual para preventas y drops.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Es un bloque placeholder. Antes de publicar conecta este formulario a tu stack
                real de captacion o eliminalo temporalmente.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Input placeholder="tuemail@coleccion.com" className="sm:flex-1" />
                <Button className="sm:min-w-40">
                  Quiero acceso
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefitIcons[benefit.id as keyof typeof benefitIcons];

              return (
                <div key={benefit.id} className="surface-soft p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          <Separator className="my-8" />

          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm leading-7 text-slate-300">
                ElitePull propone una experiencia entre boutique TCG, universo anime y escaparate
                de coleccionismo premium lista para una primera publicacion seria.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {footerLinkGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="font-heading text-lg font-semibold text-white">{group.title}</h3>
                  <div className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col gap-3 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>© 2026 ElitePull. Primera version operativa para catalogo, admin y checkout.</p>
            <div className="flex items-center gap-5">
              <Link href="/politica-privacidad" className="link-fade">
                Privacidad
              </Link>
              <Link href="/terminos" className="link-fade">
                Terminos
              </Link>
              <Link href="/envios-devoluciones" className="link-fade">
                Envios
              </Link>
              <Link href="/contacto" className="link-fade">
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
