import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { OrdersTable } from "@/components/admin/orders-table";
import { Button } from "@/components/ui/button";
import { getAdminOrdersList } from "@/lib/admin/orders";
import {
  checkoutOrderStatusSchema,
  type CheckoutOrderStatus,
} from "@/lib/validators/checkout";

type AdminOrdersPageSearchParams = Promise<{
  status?: string;
}>;

const ORDER_STATUS_OPTIONS: Array<{
  value?: CheckoutOrderStatus;
  label: string;
}> = [
  { value: undefined, label: "Todos" },
  { value: "pending_checkout", label: "Pendiente checkout" },
  { value: "checkout_created", label: "Checkout creado" },
  { value: "paid", label: "Pagado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "payment_failed", label: "Pago fallido" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: AdminOrdersPageSearchParams;
}) {
  const params = await searchParams;
  const selectedStatus = checkoutOrderStatusSchema.safeParse(params.status).success
    ? (params.status as CheckoutOrderStatus)
    : undefined;

  const [allOrders, filteredOrders] = await Promise.all([
    getAdminOrdersList(),
    selectedStatus ? getAdminOrdersList(selectedStatus) : Promise.resolve(null),
  ]);

  const orders = filteredOrders ?? allOrders;
  const paidCount = allOrders.filter((order) => order.status === "paid").length;
  const checkoutCreatedCount = allOrders.filter(
    (order) => order.status === "checkout_created",
  ).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
            Pedidos
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
            Lectura operativa de checkout V1
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Desde aqui puedes revisar pedidos creados por Stripe Checkout, su estado actual,
            el email del comprador y el total confirmado sin tocar aun flujos avanzados.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard label="Pedidos" value={String(allOrders.length)} description="Total registrado" />
          <MetricCard label="Pagados" value={String(paidCount)} description="Confirmados por webhook" />
          <MetricCard
            label="Checkout"
            value={String(checkoutCreatedCount)}
            description="Pendientes de confirmacion final"
          />
        </div>
      </section>

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Filtro rapido
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
              Estado del pedido
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Filtra por `status` para ver pagos completados, checkouts abiertos o pedidos cancelados.
            </p>
          </div>

          <p className="text-sm text-slate-400">
            {orders.length} {orders.length === 1 ? "pedido visible" : "pedidos visibles"}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {ORDER_STATUS_OPTIONS.map((option) => {
            const isActive = option.value === selectedStatus || (!option.value && !selectedStatus);
            const href = option.value ? `/admin/pedidos?status=${option.value}` : "/admin/pedidos";

            return (
              <Link
                key={option.label}
                href={href}
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-amber-300/30 bg-amber-400/10 text-amber-100"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] hover:text-white",
                ].join(" ")}
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>

      {selectedStatus ? (
        <section className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
          <span className="mr-3 text-slate-400">Filtro activo:</span>
          <OrderStatusBadge status={selectedStatus} />
        </section>
      ) : null}

      <OrdersTable orders={orders} selectedStatus={selectedStatus} />

      <section className="rounded-[28px] border border-white/10 bg-black/20 p-5 text-sm leading-7 text-slate-300">
        <p>
          El listado es solo lectura en esta V1. El siguiente paso natural sera exponer acciones
          operativas simples desde el detalle sin rehacer el circuito de checkout.
        </p>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/admin">Volver al dashboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 font-heading text-2xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}
