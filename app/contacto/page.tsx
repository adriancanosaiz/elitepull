import Link from "next/link";

import { LegalPageShell } from "@/components/store/legal-page-shell";
import { buildPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Contacto",
  description:
    "Canales de contacto base para soporte, incidencias de pedido y consultas generales en ElitePull.",
  path: "/contacto",
});

export default function ContactPage() {
  return (
    <LegalPageShell
      eyebrow="Soporte"
      title="Contacto"
      intro="Esta pagina deja un canal claro para consultas de pedido, soporte y atencion general antes del lanzamiento final."
      sections={[
        {
          title: "1. Soporte de pedidos",
          paragraphs: [
            `Usa ${siteConfig.contactEmail} como email temporal de soporte hasta sustituirlo por la direccion real del negocio.`,
            "Si recibes un pago correcto pero no ves el pedido confirmado, revisa primero el email de confirmacion, el estado en admin y el webhook de Stripe antes de contestar al cliente.",
          ],
        },
        {
          title: "2. Horario de respuesta",
          paragraphs: [
            "Incluye aqui tu horario real de atencion y el SLA orientativo de respuesta para pedidos, incidencias de envio y soporte general.",
            "Tambien puedes añadir un canal secundario como Instagram o WhatsApp cuando la operativa real este definida.",
          ],
        },
      ]}
      aside={
        <div className="space-y-4 text-sm leading-7 text-slate-300">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Email
            </p>
            <p className="mt-2 text-white">{siteConfig.contactEmail}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Navegacion
            </p>
            <div className="mt-2 space-y-2">
              <Link href="/politica-privacidad" className="block text-slate-300 hover:text-white">
                Politica de privacidad
              </Link>
              <Link href="/terminos" className="block text-slate-300 hover:text-white">
                Terminos y condiciones
              </Link>
              <Link
                href="/envios-devoluciones"
                className="block text-slate-300 hover:text-white"
              >
                Envios y devoluciones
              </Link>
            </div>
          </div>
        </div>
      }
    />
  );
}
