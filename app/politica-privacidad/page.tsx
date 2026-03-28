import { LegalPageShell } from "@/components/store/legal-page-shell";
import { buildPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Politica de privacidad",
  description:
    "Base de politica de privacidad para ElitePull. Sustituir por la version legal definitiva antes del lanzamiento final.",
  path: "/politica-privacidad",
});

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Politica de privacidad"
      intro="Este texto sirve como base inicial para explicar como se recogen, usan y conservan los datos personales en ElitePull."
      sections={[
        {
          title: "1. Responsable del tratamiento",
          paragraphs: [
            "ElitePull actua como responsable del tratamiento de los datos personales recogidos a traves del storefront, el checkout y los formularios de contacto.",
            `Antes del lanzamiento final debes sustituir este bloque con los datos reales del titular: razon social, NIF, domicilio y email legal de contacto. Puedes usar de momento ${siteConfig.contactEmail} como placeholder operativo.`,
          ],
        },
        {
          title: "2. Datos que recopilamos",
          paragraphs: [
            "Podemos recopilar datos de compra y contacto como email, nombre, identificadores de pedido, historico de pagos y comunicaciones relacionadas con soporte o incidencias.",
            "Tambien pueden procesarse datos tecnicos basicos necesarios para seguridad, autenticacion del panel admin y funcionamiento del carrito o del checkout.",
          ],
        },
        {
          title: "3. Finalidad y base legal",
          paragraphs: [
            "Usamos los datos para procesar pedidos, enviar emails transaccionales, responder solicitudes de contacto y mantener la seguridad operativa del servicio.",
            "La base legal variara segun el caso: ejecucion de contrato para pedidos, interes legitimo para seguridad y soporte, y consentimiento cuando proceda.",
          ],
        },
        {
          title: "4. Conservacion y terceros",
          paragraphs: [
            "Los datos se conservaran durante el tiempo necesario para gestionar pedidos, obligaciones contables, soporte y cumplimiento normativo.",
            "ElitePull puede apoyarse en terceros como Supabase, Stripe, Resend y Vercel para alojamiento, pagos, correo y operativa tecnica. Antes de publicar, revisa y documenta sus condiciones y transferencias internacionales si aplican.",
          ],
        },
        {
          title: "5. Derechos de las personas usuarias",
          paragraphs: [
            "Las personas usuarias podran solicitar acceso, rectificacion, supresion, oposicion, limitacion o portabilidad de sus datos conforme a la normativa aplicable.",
            "Incluye aqui el canal real para ejercer derechos y el procedimiento interno de respuesta antes del lanzamiento definitivo.",
          ],
        },
      ]}
    />
  );
}
