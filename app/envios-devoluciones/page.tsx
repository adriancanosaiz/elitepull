import { LegalPageShell } from "@/components/store/legal-page-shell";
import { buildPageMetadata } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Envios y devoluciones",
  description:
    "Base operativa para explicar envios, plazos, incidencias y devoluciones en ElitePull.",
  path: "/envios-devoluciones",
});

export default function ShippingReturnsPage() {
  return (
    <LegalPageShell
      eyebrow="Soporte"
      title="Envios y devoluciones"
      intro="Esta pagina resume la politica operativa minima de envios, plazos e incidencias para una primera publicacion."
      sections={[
        {
          title: "1. Preparacion y envio",
          paragraphs: [
            "Los pedidos se preparan por orden de confirmacion de pago. Define antes de publicar los plazos reales de preparacion, el transportista y las zonas geograficas atendidas.",
            "Si trabajas con producto sensible de coleccionismo, conviene especificar el tipo de embalaje, seguros y cobertura ante incidencias de transporte.",
          ],
        },
        {
          title: "2. Preventas y productos con fecha futura",
          paragraphs: [
            "Los productos en preventa pueden tener una fecha de salida posterior a la compra. Debes indicar de forma clara las condiciones de cobro, envio y posibles cambios de calendario.",
            "Si un pedido mezcla preventa y producto disponible, concreta si se envia junto o por separado y como afecta eso al coste final de envio.",
          ],
        },
        {
          title: "3. Devoluciones e incidencias",
          paragraphs: [
            "Antes de produccion debes fijar un criterio claro para cancelaciones, devoluciones, defectos de fabrica, errores de picking y paquetes dañados en transporte.",
            "Es recomendable documentar los plazos para reportar incidencias y el canal exacto de contacto para que el comprador sepa como actuar.",
          ],
        },
        {
          title: "4. Reembolsos",
          paragraphs: [
            "Los reembolsos no forman parte de la V1 operativa del panel admin, por lo que la politica final debe describir como se tramitaran de forma manual y en que plazos.",
            "Sustituye este texto por la operativa real antes de aceptar pedidos de produccion.",
          ],
        },
      ]}
    />
  );
}
