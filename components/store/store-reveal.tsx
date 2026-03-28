"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  storefrontRevealOffset,
  storefrontRevealTransition,
} from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";

export function StoreReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: storefrontRevealOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        ...storefrontRevealTransition,
        delay,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
