import Link from "next/link";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { Button } from "@/components/ui/button";
import type { AdminOrderListItem } from "@/lib/admin/orders";

export function OrdersTable({
  orders,
  selectedStatus,
}: {
  orders: AdminOrderListItem[];
  selectedStatus?: string;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-[30px] border border-dashed border-white/12 bg-black/20 p-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Sin pedidos
        </p>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-white">
          {selectedStatus
            ? "No hay pedidos con este estado"
            : "Todavía no ha llegado ningún pedido"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
          {selectedStatus
            ? "Prueba con otro filtro o pulsa 'Todos' para ver todos los pedidos."
            : "Cuando un cliente complete una compra, aparecerá aquí automáticamente."}
        </p>
        {selectedStatus ? (
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link href="/admin/pedidos">Ver todos los pedidos</Link>
            </Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {/* Tabla desktop */}
      <div className="hidden overflow-hidden rounded-[30px] border border-white/10 bg-black/20 xl:block">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03]">
            <tr className="text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <th className="px-5 py-4">Nº Pedido</th>
              <th className="px-5 py-4">Fecha</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Total</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Artículos</th>
              <th className="px-5 py-4 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {orders.map((order) => (
              <tr key={order.id} className="align-top">
                <td className="px-5 py-5">
                  <div className="space-y-1">
                    <p className="font-semibold uppercase tracking-[0.16em] text-white">
                      #{formatShortOrderId(order.id)}
                    </p>
                    <p className="text-xs text-slate-600">{order.id.slice(0, 18)}…</p>
                  </div>
                </td>
                <td className="px-5 py-5 text-slate-200">{formatAdminDate(order.createdAt)}</td>
                <td className="px-5 py-5">
                  <div className="space-y-0.5 text-slate-200">
                    <p>{order.customerEmail}</p>
                    {order.customerName ? (
                      <p className="text-xs text-slate-500">{order.customerName}</p>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-5 text-slate-200">
                  {formatOrderPrice(order.amountTotal, order.currency)}
                </td>
                <td className="px-5 py-5">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-5 py-5 text-slate-200">
                  {order.itemsCount} {order.itemsCount === 1 ? "artículo" : "artículos"}
                </td>
                <td className="px-5 py-5 text-right">
                  <Button asChild size="sm">
                    <Link href={`/admin/pedidos/${order.id}`}>Abrir</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards móvil/tablet */}
      <div className="grid gap-4 xl:hidden">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[28px] border border-white/10 bg-black/20 p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold uppercase tracking-[0.16em] text-white">
                  #{formatShortOrderId(order.id)}
                </p>
                <div className="mt-2 space-y-0.5 text-xs text-slate-400">
                  <p>{order.customerEmail}</p>
                  <p>{formatAdminDate(order.createdAt)}</p>
                  <p>{order.itemsCount} {order.itemsCount === 1 ? "artículo" : "artículos"}</p>
                </div>
              </div>

              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm font-medium text-slate-200">
                Total: {formatOrderPrice(order.amountTotal, order.currency)}
              </div>

              <Button asChild size="sm">
                <Link href={`/admin/pedidos/${order.id}`}>Ver detalle</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </>
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
