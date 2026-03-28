"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/components/store/cart-provider";

export function CheckoutSuccessCartReset() {
  const { clearCart } = useCart();
  const hasClearedCartRef = useRef(false);

  useEffect(() => {
    if (hasClearedCartRef.current) {
      return;
    }

    hasClearedCartRef.current = true;
    clearCart();
  }, [clearCart]);

  return null;
}
