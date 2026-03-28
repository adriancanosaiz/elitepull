import { LegalPageShell } from "@/components/store/legal-page-shell";
import { buildPageMetadata } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Terminos y condiciones",
  description:
    "Base inicial de terminos y condiciones para ventas en ElitePull. Sustituir por texto legal final antes de produccion.",
  path: "/terminos",
});

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Legal"
      title="Terminos y condiciones"
      intro="Estas condiciones resumen el marco minimo de compra y uso del sitio en esta version de preproduccion."
      sections={[
        {
          title: "1. Objeto del sitio",
          paragraphs: [
            "ElitePull ofrece catalogo, carrito, checkout y comunicacion comercial relacionados con cartas coleccionables, producto sellado y accesorios.",
            "La publicacion de productos no implica aceptacion automatica de la venta hasta la correcta validacion del pago y de la disponibilidad final del pedido.",
          ],
        },
        {
          title: "2. Proceso de compra",
          paragraphs: [
            "El usuario selecciona productos, accede al carrito y finaliza el pago a traves de Stripe Checkout. El importe final y la disponibilidad se recalculan en servidor antes de crear el pedido.",
            "La confirmacion definitiva del pedido depende del webhook de pago y del estado final registrado en la base de datos.",
          ],
        },
        {
          title: "3. Precios, stock y errores",
          paragraphs: [
            "Los precios se muestran en euros salvo que se indique otra moneda. ElitePull puede corregir errores tipograficos, de precio o de catalogo cuando exista causa justificada.",
            "El stock visible intenta reflejar disponibilidad real, pero conviene revisar y actualizar la politica final de incidencias, cancelaciones y roturas de stock antes del lanzamiento definitivo.",
          ],
        },
        {
          title: "4. Pagos y limitacion de responsabilidad",
          paragraphs: [
            "Los pagos se procesan mediante Stripe. ElitePull no almacena datos completos de tarjeta en su propia aplicacion.",
            "Debes completar este apartado con las limitaciones de responsabilidad, jurisdiccion, ley aplicable y tratamiento de incidencias segun tu operativa real.",
          ],
        },
      ]}
    />
  );
}
