import Link from "next/link";

import { CheckoutSuccessCartReset } from "@/components/store/checkout-success-cart-reset";
import { Button } from "@/components/ui/button";
import { getPublicCheckoutOrderBySessionId } from "@/lib/checkout/public-orders";
import type { CheckoutOrderStatus } from "@/lib/validators/checkout";

type CheckoutSuccessSearchParams = Promise<{
  session_id?: string;
}>;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: CheckoutSuccessSearchParams;
}) {
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id.trim() : "";
  const order = sessionId ? await getPublicCheckoutOrderBySessionId(sessionId) : null;
  const isPaid = order?.status === "paid";
  const shouldClearCart = order?.status === "paid" || order?.status === "checkout_created";

  return (
    <section className="app-container flex min-h-[70vh] items-center py-12">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/20 p-8 text-center md:p-10">
        {shouldClearCart ? <CheckoutSuccessCartReset /> : null}

        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-200/80">
          Checkout completado
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-white md:text-5xl">
          {isPaid ? "Pedido confirmado" : "Estamos confirmando tu pago"}
        </h1>
        <p className="mt-4 text-sm leading-8 text-slate-300 md:text-base">
          La fuente de verdad sigue siendo el webhook de Stripe. Esta pagina solo refleja el estado
          que tenemos ahora mismo y no marca el pedido como pagado por si sola.
        </p>

        {order ? (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-sm text-slate-300">
            <div className="grid gap-4 md:grid-cols-2">
              <InfoLine label="Pedido" value={formatShortOrderId(order.orderId)} />
              <InfoLine label="Estado" value={getStatusLabel(order.status)} />
              <InfoLine label="Email" value={order.customerEmail} />
              <InfoLine
                label="Total"
                value={formatOrderPrice(order.amountTotal, order.currency)}
              />
            </div>
          </div>
        ) : null}

        {sessionId ? (
          <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-left text-sm text-slate-300">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Session ID
            </p>
            <p className="mt-2 break-all text-white">{sessionId}</p>
          </div>
        ) : null}

        {!isPaid ? (
          <div className="mt-6 rounded-[24px] border border-amber-300/30 bg-amber-400/10 px-5 py-4 text-sm leading-7 text-amber-50">
            Estamos confirmando el pago. Si Stripe ya te mostro el cobro correcto, lo normal es
            que el pedido pase a <span className="font-semibold">paid</span> en unos segundos
            cuando entre el webhook.
          </div>
        ) : (
          <div className="mt-6 rounded-[24px] border border-emerald-400/30 bg-emerald-500/10 px-5 py-4 text-sm leading-7 text-emerald-50">
            El webhook ya ha confirmado el pedido y el carrito se ha vaciado en este navegador.
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/catalogo">Seguir comprando</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function InfoLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-all text-white">{value}</p>
    </div>
  );
}

function formatShortOrderId(value: string) {
  return value.slice(0, 8).toUpperCase();
}

function getStatusLabel(status: CheckoutOrderStatus) {
  switch (status) {
    case "paid":
      return "Pagado";
    case "checkout_created":
      return "Checkout creado";
    case "pending_checkout":
      return "Pendiente checkout";
    case "payment_failed":
      return "Pago fallido";
    default:
      return "Cancelado";
  }
}

function formatOrderPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
