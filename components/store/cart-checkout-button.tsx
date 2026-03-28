"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import type { StoredCartItem } from "@/types/store";

function getCheckoutErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo iniciar el checkout.";
}

export function CartCheckoutButton({
  rawItems,
  customerEmail,
  disabled = false,
}: {
  rawItems: StoredCartItem[];
  customerEmail: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCheckout() {
    startTransition(async () => {
      setError(null);

      try {
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            customerEmail,
            items: rawItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          error?: string;
          checkoutUrl?: string;
        };

        if (!response.ok || !payload.checkoutUrl) {
          throw new Error(payload.error ?? "No se pudo crear la sesion de checkout.");
        }

        window.location.href = payload.checkoutUrl;
      } catch (checkoutError) {
        setError(getCheckoutErrorMessage(checkoutError));
      }
    });
  }

  return (
    <div className="space-y-3">
      <Button
        className="w-full"
        size="lg"
        onClick={handleCheckout}
        disabled={disabled || isPending}
      >
        {isPending ? "Redirigiendo a Stripe..." : "Pagar con Stripe"}
      </Button>

      {error ? (
        <div className="rounded-[22px] border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
    </div>
  );
}
