"use client";

import { useEffect, useState, type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { StoreMediaImage } from "@/components/store/store-media-image";
import {
  storefrontImageTransition,
  storefrontMotionEase,
  storefrontTiltMaxDegrees,
} from "@/lib/storefront-motion";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  fallbackSrc,
}: {
  images: string[];
  name: string;
  fallbackSrc: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0] ?? fallbackSrc);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const scale = useMotionValue(1);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const smoothRotateX = useSpring(rotateX, { stiffness: 180, damping: 22, mass: 0.5 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 180, damping: 22, mass: 0.5 });
  const smoothScale = useSpring(scale, { stiffness: 170, damping: 24, mass: 0.55 });
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.22), rgba(128,226,221,0.12) 16%, transparent 42%)`;

  useEffect(() => {
    setActiveImage(images[0] ?? fallbackSrc);
  }, [images, fallbackSrc]);

  useEffect(() => {
    if (shouldReduceMotion || typeof window === "undefined") {
      setIsTiltEnabled(false);
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateTiltAvailability = () => setIsTiltEnabled(mediaQuery.matches);

    updateTiltAvailability();
    mediaQuery.addEventListener("change", updateTiltAvailability);

    return () => {
      mediaQuery.removeEventListener("change", updateTiltAvailability);
    };
  }, [shouldReduceMotion]);

  function resetTiltState() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    glowX.set(50);
    glowY.set(50);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isTiltEnabled) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    rotateY.set((relativeX - 0.5) * storefrontTiltMaxDegrees);
    rotateX.set((0.5 - relativeY) * storefrontTiltMaxDegrees);
    scale.set(1.008);
    glowX.set(relativeX * 100);
    glowY.set(relativeY * 100);
  }

  return (
    <div className="space-y-4">
      <div className="surface-card relative overflow-hidden border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,20,30,0.96),rgba(9,12,19,0.88))] p-4 shadow-[0_24px_60px_rgba(4,8,18,0.24)]">
        <div className="collector-constellation pointer-events-none absolute inset-0 opacity-35" />
        <div className="kinetic-lines pointer-events-none absolute inset-0 opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%),radial-gradient(circle_at_bottom,rgba(245,199,112,0.08),transparent_38%)]" />
        <div className="shine-pass" />
        <motion.div
          onPointerMove={isTiltEnabled ? handlePointerMove : undefined}
          onPointerLeave={isTiltEnabled ? resetTiltState : undefined}
          style={
            isTiltEnabled
              ? {
                  rotateX: smoothRotateX,
                  rotateY: smoothRotateY,
                  scale: smoothScale,
                  transformPerspective: 1400,
                }
              : undefined
          }
          className="relative overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] p-6"
        >
          <div className="collector-orbit pointer-events-none absolute left-1/2 top-1/2 h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45" />
          <div className="collector-orbit pointer-events-none absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30" />
          <div className="pointer-events-none absolute inset-x-10 top-4 h-24 rounded-full bg-white/[0.06] blur-3xl" />
          <div className="pointer-events-none absolute inset-x-16 bottom-3 h-12 rounded-full bg-primary/12 blur-3xl" />
          <div className="shine-pass" />
          <div className="pointer-events-none absolute right-4 top-4 rounded-full border border-white/10 bg-black/[0.25] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300 backdrop-blur-md">
            Main visual
          </div>
          {isTiltEnabled ? (
            <motion.div
              aria-hidden="true"
              style={{ background: glowBackground }}
              className="pointer-events-none absolute inset-0 rounded-[30px] opacity-75"
            />
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.992, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 1.012, y: -4 }}
              transition={storefrontImageTransition}
              className={cn(
                "relative flex min-h-[420px] items-center justify-center md:min-h-[560px]",
                !isTiltEnabled && !shouldReduceMotion && "media-float",
              )}
            >
              <StoreMediaImage
                src={activeImage}
                fallbackSrc={fallbackSrc}
                alt={name}
                width={900}
                height={1100}
                className="mx-auto h-[420px] w-auto object-contain drop-shadow-[0_24px_48px_rgba(2,6,16,0.28)] md:h-[560px]"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {images.map((image, index) => (
          <motion.button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            transition={{ duration: 0.2, ease: storefrontMotionEase }}
            className={cn(
              "surface-soft group/thumb overflow-hidden rounded-[22px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-2 transition-[border-color,background-color,box-shadow,transform] duration-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:shadow-[0_14px_30px_rgba(4,8,18,0.16)]",
              activeImage === image &&
                "border-primary/35 bg-primary/10 shadow-[0_16px_32px_rgba(234,179,8,0.16)]",
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-[18px] border border-transparent transition-colors duration-300",
                activeImage === image ? "border-primary/35" : "group-hover/thumb:border-white/12",
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,transparent,rgba(4,8,18,0.16))] transition-opacity duration-300",
                  activeImage === image ? "opacity-0" : "opacity-100",
                )}
              />
            <StoreMediaImage
              src={image}
              fallbackSrc={fallbackSrc}
              alt={`${name} miniatura ${index + 1}`}
              width={220}
              height={260}
              className="h-24 w-full rounded-[18px] object-cover transition-[transform,filter] duration-300 group-hover/thumb:scale-[1.02] group-hover/thumb:brightness-105"
            />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
