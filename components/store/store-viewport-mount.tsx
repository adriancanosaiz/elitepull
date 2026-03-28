"use client";

import { startTransition, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { storefrontMotionEase } from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";

export function StoreViewportMount({
  children,
  from = "left",
  className,
  placeholderClassName,
}: {
  children: ReactNode;
  from?: "left" | "right" | "up";
  className?: string;
  placeholderClassName?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setIsMounted(true);
      return;
    }

    if (isMounted || !anchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            startTransition(() => {
              setIsMounted(true);
            });
            observer.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: "120px 0px -8% 0px",
        threshold: 0.12,
      },
    );

    observer.observe(anchorRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isMounted, shouldReduceMotion]);

  if (!isMounted) {
    return (
      <div
        ref={anchorRef}
        className={cn(
          "relative overflow-hidden rounded-[30px] border border-transparent bg-transparent",
          placeholderClassName,
        )}
      >
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
    );
  }

  const initial =
    from === "left"
      ? { opacity: 0, x: -56, y: 8, scale: 0.985 }
      : from === "right"
        ? { opacity: 0, x: 56, y: 8, scale: 0.985 }
        : { opacity: 0, x: 0, y: 18, scale: 0.985 };

  return (
    <motion.div
      ref={anchorRef}
      initial={shouldReduceMotion ? false : initial}
      animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{
        duration: 0.82,
        ease: storefrontMotionEase,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
