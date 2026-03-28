import { Badge } from "@/components/ui/badge";
import type { CheckoutOrderStatus } from "@/lib/validators/checkout";

export function OrderStatusBadge({
  status,
}: {
  status: CheckoutOrderStatus;
}) {
  if (status === "paid") {
    return (
      <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100">
        Pagado
      </Badge>
    );
  }

  if (status === "checkout_created") {
    return (
      <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
        Checkout creado
      </Badge>
    );
  }

  if (status === "pending_checkout") {
    return (
      <Badge className="border-amber-300/30 bg-amber-400/10 text-amber-100">
        Pendiente checkout
      </Badge>
    );
  }

  if (status === "payment_failed") {
    return (
      <Badge className="border-rose-400/30 bg-rose-500/10 text-rose-100">
        Pago fallido
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="border-white/10 bg-white/[0.04] text-slate-300">
      Cancelado
    </Badge>
  );
}
