import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <section className="app-container flex min-h-[70vh] items-center py-12">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-white/10 bg-black/20 p-8 text-center md:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/80">
          Checkout cancelado
        </p>
        <h1 className="mt-4 font-heading text-4xl font-semibold text-white md:text-5xl">
          El pago no se ha completado
        </h1>
        <p className="mt-4 text-sm leading-8 text-slate-300 md:text-base">
          Puedes volver al carrito para revisar cantidades, cambiar productos o intentar el pago
          otra vez. Esta pagina no modifica el estado del pedido por si sola.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/carrito">Volver al carrito</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/catalogo">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
