"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn, ZoomOut } from "lucide-react";

import { StoreMediaImage } from "@/components/store/store-media-image";
import { cn } from "@/lib/utils";

export function ProductLightbox({
  src,
  fallbackSrc,
  alt,
  open,
  onClose,
}: {
  src: string;
  fallbackSrc: string;
  alt: string;
  open: boolean;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const posRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const applyTransform = useCallback(() => {
    if (!imageRef.current) return;
    const { x, y } = posRef.current;
    imageRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scaleRef.current})`;
  }, []);

  const resetTransform = useCallback(() => {
    scaleRef.current = 1;
    posRef.current = { x: 0, y: 0 };
    applyTransform();
  }, [applyTransform]);

  const zoomIn = useCallback(() => {
    scaleRef.current = Math.min(scaleRef.current + 0.5, 4);
    applyTransform();
  }, [applyTransform]);

  const zoomOut = useCallback(() => {
    scaleRef.current = Math.max(scaleRef.current - 0.5, 1);
    if (scaleRef.current <= 1) {
      posRef.current = { x: 0, y: 0 };
    }
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    if (!open) return;

    resetTransform();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "+" || event.key === "=") {
        zoomIn();
      } else if (event.key === "-") {
        zoomOut();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, resetTransform, zoomIn, zoomOut]);

  function handlePointerDown(event: React.PointerEvent) {
    if (scaleRef.current <= 1) return;
    draggingRef.current = true;
    dragStartRef.current = {
      x: event.clientX - posRef.current.x,
      y: event.clientY - posRef.current.y,
    };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent) {
    if (!draggingRef.current) return;
    posRef.current = {
      x: event.clientX - dragStartRef.current.x,
      y: event.clientY - dragStartRef.current.y,
    };
    applyTransform();
  }

  function handlePointerUp() {
    draggingRef.current = false;
  }

  function handleDoubleClick() {
    if (scaleRef.current > 1) {
      resetTransform();
    } else {
      scaleRef.current = 2.5;
      applyTransform();
    }
  }

  function handleWheel(event: React.WheelEvent) {
    event.preventDefault();
    if (event.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Vista ampliada de ${alt}`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Controls */}
          <div className="absolute right-4 top-4 z-[102] flex items-center gap-2 sm:right-6 sm:top-6">
            <button
              type="button"
              onClick={zoomIn}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/80 backdrop-blur-md transition-colors hover:bg-white/[0.12] hover:text-white"
              aria-label="Ampliar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={zoomOut}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/80 backdrop-blur-md transition-colors hover:bg-white/[0.12] hover:text-white"
              aria-label="Reducir"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] text-white/80 backdrop-blur-md transition-colors hover:bg-white/[0.12] hover:text-white"
              aria-label="Cerrar visor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Hint */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-6 left-1/2 z-[102] -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-[11px] text-slate-400 backdrop-blur-md"
          >
            Doble clic para zoom · Arrastra para mover · Scroll para acercar/alejar
          </motion.p>

          {/* Image container */}
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative z-[101] flex h-[85vh] w-[90vw] max-w-[900px] items-center justify-center overflow-hidden rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,20,30,0.96),rgba(9,12,19,0.92))] p-6 shadow-[0_40px_120px_rgba(2,6,23,0.6)]",
            )}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: "none" }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" />

            <div
              ref={imageRef}
              className="transition-transform duration-150 ease-out"
              style={{ willChange: "transform", cursor: scaleRef.current > 1 ? "grab" : "zoom-in" }}
            >
              <StoreMediaImage
                src={src}
                fallbackSrc={fallbackSrc}
                alt={alt}
                width={1200}
                height={1500}
                sizes="90vw"
                quality={92}
                className="max-h-[78vh] w-auto object-contain drop-shadow-[0_24px_48px_rgba(2,6,16,0.3)]"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
