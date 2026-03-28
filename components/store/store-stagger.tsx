"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import {
  storefrontMotionEase,
  storefrontRevealOffset,
  storefrontStaggerChildren,
  storefrontStaggerDelay,
} from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";

export function StoreStagger({
  children,
  className,
  itemClassName,
  delayChildren = 0,
  variant = "rise",
  distance = 52,
}: {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  delayChildren?: number;
  variant?: "rise" | "alternate-sides";
  distance?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px", amount: 0.24 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: storefrontStaggerChildren,
            delayChildren: delayChildren + storefrontStaggerDelay,
          },
        },
      }}
      className={cn(className)}
    >
      {Children.map(children, (child, index) =>
        child ? (
          <motion.div
            key={index}
            variants={{
              hidden: {
                opacity: 0,
                y: storefrontRevealOffset,
                x:
                  variant === "alternate-sides"
                    ? index % 2 === 0
                      ? -distance
                      : distance
                    : 0,
                scale: 0.985,
              },
              visible: {
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
                transition: {
                  duration: 0.62,
                  ease: storefrontMotionEase,
                },
              },
            }}
            className={cn(itemClassName)}
          >
            {child}
          </motion.div>
        ) : null,
      )}
    </motion.div>
  );
}
