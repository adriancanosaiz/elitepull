import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  cancelAdminOrderAction,
  markAdminOrderPaymentFailedAction,
  resendAdminOrderConfirmationEmailAction,
} from "@/app/admin/pedidos/actions";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import { formatCheckoutOrderAddress } from "@/lib/checkout/delivery";
import { getAdminOrderById } from "@/lib/admin/orders";

type AdminOrderDetailPageParams = Promise<{
  id: string;
}>;

type AdminOrderDetailPageSearchParams = Promise<{
  success?: string;
  error?: string;
}>;

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: AdminOrderDetailPageParams;
  searchParams: AdminOrderDetailPageSearchParams;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const successMessage = mapOrderSuccessMessage(resolvedSearchParams.success);
  const canCancel =
    order.status === "pending_checkout" ||
    order.status === "checkout_created" ||
    order.status === "payment_failed";
  const canMarkPaymentFailed = order.status === "checkout_created";
  const canResendConfirmationEmail = order.status === "paid";
  const shippingAddressLines = formatCheckoutOrderAddress(order.shippingAddress);
  const billingAddressLines = formatCheckoutOrderAddress(order.billingAddress);
  const invoiceRequested =
    typeof order.metadata.invoiceRequested === "boolean"
      ? order.metadata.invoiceRequested
      : null;
  const invoiceTaxId =
    typeof order.metadata.invoiceTaxId === "string" && order.metadata.invoiceTaxId.trim().length > 0
      ? order.metadata.invoiceTaxId
      : null;

  return (
    <div className="space-y-6">
      {resolvedSearchParams.error ? (
        <Notice tone="error">{resolvedSearchParams.error}</Notice>
      ) : null}
      {successMessage ? <Notice tone="success">{successMessage}</Notice> : null}

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
              Detalle de pedido
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
              {formatShortOrderId(order.id)}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <OrderStatusBadge status={order.status} />
              <span>{formatAdminDate(order.createdAt)}</span>
              <span>{formatOrderPrice(order.amountTotal, order.currency)}</span>
            </div>
          </div>

          <Button asChild variant="outline" size="lg">
            <Link href="/admin/pedidos">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <InfoCard
          eyebrow="Pedido"
          title="Datos principales"
          lines={[
            { label: "ID completo", value: order.id },
            { label: "Estado", value: order.status },
            { label: "Fecha", value: formatAdminDate(order.createdAt) },
            { label: "Items", value: String(order.itemsCount) },
            { label: "Total", value: formatOrderPrice(order.amountTotal, order.currency) },
            { label: "Source", value: order.source ?? "storefront" },
          ]}
        />

        <InfoCard
          eyebrow="Cliente"
          title="Contacto"
          lines={[
            { label: "Email", value: order.customerEmail },
            { label: "Nombre", value: order.customerName ?? "No informado" },
            { label: "Notas", value: order.notes ?? "Sin notas" },
          ]}
        />

        <InfoCard
          eyebrow="Stripe"
          title="Referencias de pago"
          lines={[
            {
              label: "Checkout Session",
              value: order.stripeCheckoutSessionId ?? "Aun no asignado",
            },
            {
              label: "Payment Intent",
              value: order.stripePaymentIntentId ?? "Aun no asignado",
            },
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AddressCard
          eyebrow="Entrega"
          title="Datos de envio"
          contactLines={[
            { label: "Nombre de envio", value: order.shippingName ?? "No disponible" },
            { label: "Telefono", value: order.shippingPhone ?? "No disponible" },
            {
              label: "Tarifa",
              value: order.shippingRateLabel ?? "No disponible",
            },
            {
              label: "Importe envio",
              value:
                typeof order.shippingRateAmount === "number"
                  ? formatOrderPrice(order.shippingRateAmount, order.currency)
                  : "No disponible",
            },
          ]}
          addressLines={shippingAddressLines}
          emptyMessage="Stripe todavia no ha devuelto una direccion de envio para este pedido."
        />

        <AddressCard
          eyebrow="Facturacion"
          title="Direccion de facturacion"
          contactLines={[
            {
              label: "Factura solicitada",
              value:
                invoiceRequested === null
                  ? "No indicado"
                  : invoiceRequested
                    ? "Si"
                    : "No",
            },
            ...(invoiceTaxId
              ? [{ label: "NIF o CIF", value: invoiceTaxId }]
              : []),
          ]}
          addressLines={billingAddressLines}
          emptyMessage="Stripe no ha devuelto datos de facturacion para este pedido."
        />
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Acciones V1
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
          Operativa manual segura
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Solo se muestran acciones coherentes con el estado actual del pedido. Los pedidos
          pagados no se cancelan desde esta V1 para no mezclar operativa con refunds.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {canCancel ? (
            <form action={cancelAdminOrderAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <Button type="submit" variant="outline">
                Marcar cancelado
              </Button>
            </form>
          ) : null}

          {canMarkPaymentFailed ? (
            <form action={markAdminOrderPaymentFailedAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <Button type="submit" variant="outline">
                Marcar pago fallido
              </Button>
            </form>
          ) : null}

          {canResendConfirmationEmail ? (
            <form action={resendAdminOrderConfirmationEmailAction}>
              <input type="hidden" name="orderId" value={order.id} />
              <Button type="submit">
                Reenviar email
              </Button>
            </form>
          ) : null}
        </div>

        {!canCancel && !canMarkPaymentFailed && !canResendConfirmationEmail ? (
          <p className="mt-5 text-sm text-slate-400">
            Este pedido no tiene acciones manuales disponibles en esta V1.
          </p>
        ) : null}
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Items snapshot
        </p>
        <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
          Lineas del pedido
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Estos valores son snapshots del momento de compra y no dependen del estado actual del catalogo.
        </p>

        <div className="mt-6 overflow-hidden rounded-[26px] border border-white/10">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/[0.03]">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <th className="px-4 py-4">Nombre</th>
                <th className="px-4 py-4">Slug</th>
                <th className="px-4 py-4">Precio unitario</th>
                <th className="px-4 py-4">Cantidad</th>
                <th className="px-4 py-4">Line total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {order.items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{item.productNameSnapshot}</p>
                      <p className="text-xs text-slate-500">
                        {item.brandSlugSnapshot} · {item.productTypeSnapshot}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-300">
                    {item.productSlugSnapshot}
                  </td>
                  <td className="px-4 py-4 text-slate-200">
                    {formatOrderPrice(item.unitPrice, order.currency)}
                  </td>
                  <td className="px-4 py-4 text-slate-200">{item.quantity}</td>
                  <td className="px-4 py-4 text-slate-200">
                    {formatOrderPrice(item.lineTotal, order.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  eyebrow,
  title,
  lines,
}: {
  eyebrow: string;
  title: string;
  lines: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5 space-y-4 text-sm">
        {lines.map((line) => (
          <div key={line.label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {line.label}
            </p>
            <p className="mt-2 break-all text-slate-200">{line.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AddressCard({
  eyebrow,
  title,
  contactLines,
  addressLines,
  emptyMessage,
}: {
  eyebrow: string;
  title: string;
  contactLines: Array<{ label: string; value: string }>;
  addressLines: string[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-2xl font-semibold text-white">{title}</h2>

      {contactLines.length > 0 ? (
        <div className="mt-5 space-y-4 text-sm">
          {contactLines.map((line) => (
            <div key={line.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {line.label}
              </p>
              <p className="mt-2 break-all text-slate-200">{line.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className={contactLines.length > 0 ? "mt-5" : "mt-5"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Direccion
        </p>

        {addressLines.length > 0 ? (
          <div className="mt-2 space-y-1 text-sm text-slate-200">
            {addressLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-400">{emptyMessage}</p>
        )}
      </div>
    </section>
  );
}

function formatShortOrderId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatOrderPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}

function Notice({
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

function mapOrderSuccessMessage(code?: string) {
  switch (code) {
    case "cancelled":
      return "Pedido marcado como cancelado correctamente.";
    case "payment-failed":
      return "Pedido marcado como pago fallido correctamente.";
    case "email-resent":
      return "Email de confirmacion reenviado correctamente.";
    default:
      return undefined;
  }
}
