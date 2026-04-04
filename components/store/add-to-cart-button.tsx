"use client";

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCart } from "@/components/store/cart-provider";
import { MagneticButton } from "@/components/store/magnetic-button";
import { useToast } from "@/components/store/toast-provider";
import { Button, type ButtonProps } from "@/components/ui/button";
import { storefrontMotionEase } from "@/lib/storefront-motion";
import type { StoredCartItemSnapshot } from "@/types/store";

type AddToCartButtonProps = {
  productId: string;
  quantity?: number;
  snapshot: StoredCartItemSnapshot;
  disabled?: boolean;
  idleLabel: string;
  addedLabel?: string;
  className?: string;
  size?: ButtonProps["size"];
};

export function AddToCartButton({
  productId,
  quantity = 1,
  snapshot,
  disabled = false,
  idleLabel,
  addedLabel = "Añadido",
  className,
  size = "sm",
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const { showCartToast } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const buttonControls = useAnimationControls();
  const timeoutRef = useRef<number | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function handleClick() {
    if (disabled) {
      return;
    }

    addItem(productId, quantity, snapshot);
    setIsAdded(true);
    showCartToast(`${snapshot.name} añadido al carrito`);

    if (!shouldReduceMotion) {
      void buttonControls.start({
        scale: [1, 0.97, 1.035, 1],
        y: [0, -1, 0],
        transition: { duration: 0.42, ease: storefrontMotionEase },
      });
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsAdded(false);
      timeoutRef.current = null;
    }, 1400);
  }

  return (
    <MagneticButton strength={8}>
      <motion.div animate={buttonControls}>
        <Button
          size={size}
          onClick={handleClick}
          disabled={disabled}
          className={className}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isAdded ? "added" : "idle"}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.22, ease: storefrontMotionEase }}
              className="inline-flex items-center gap-2"
            >
              {isAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              <span>{isAdded ? addedLabel : idleLabel}</span>
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    </MagneticButton>
  );
}
