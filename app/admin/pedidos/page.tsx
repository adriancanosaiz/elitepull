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
  description: string;
}> = [
  { value: undefined, label: "Todos", description: "Ver todos los pedidos" },
  { value: "pending_checkout", label: "Sin completar", description: "El cliente no llegó al pago" },
  { value: "checkout_created", label: "En proceso", description: "Checkout abierto, esperando pago" },
  { value: "paid", label: "Pagados", description: "Pago confirmado por Stripe" },
  { value: "cancelled", label: "Cancelados", description: "Pedido cancelado" },
  { value: "payment_failed", label: "Pago fallido", description: "El pago no se completó" },
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
  const pendingCount = allOrders.filter(
    (order) => order.status === "pending_checkout" || order.status === "checkout_created",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
            Pedidos
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
            Pedidos recibidos
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Aquí aparecen todos los pedidos que han llegado a la tienda. Puedes ver el estado
            de cada uno, el cliente que lo hizo y el importe total.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <QuickStat
            label="Total pedidos"
            value={String(allOrders.length)}
            description="registrados en la tienda"
          />
          <QuickStat
            label="Pagados"
            value={String(paidCount)}
            description="pago confirmado por Stripe"
          />
          <QuickStat
            label="Pendientes"
            value={String(pendingCount)}
            description="sin confirmar o en proceso"
          />
        </div>
      </section>

      {/* Filtros */}
      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Filtrar por estado
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white">
              ¿Qué pedidos quieres ver?
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            {selectedStatus ? " filtrados" : " en total"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {ORDER_STATUS_OPTIONS.map((option) => {
            const isActive = option.value === selectedStatus || (!option.value && !selectedStatus);
            const href = option.value ? `/admin/pedidos?status=${option.value}` : "/admin/pedidos";

            return (
              <Link
                key={option.label}
                href={href}
                title={option.description}
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

        {selectedStatus ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <span>Filtrando por:</span>
            <OrderStatusBadge status={selectedStatus} />
            <Link href="/admin/pedidos" className="ml-1 text-xs underline underline-offset-2 hover:text-white">
              Quitar filtro
            </Link>
          </div>
        ) : null}
      </section>

      <OrdersTable orders={orders} selectedStatus={selectedStatus} />
    </div>
  );
}

function QuickStat({
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
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
