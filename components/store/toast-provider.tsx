"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, X } from "lucide-react";

type Toast = {
  id: number;
  message: string;
  type: "cart" | "success";
};

type ToastContextValue = {
  showCartToast: (message: string) => void;
  showSuccessToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showCartToast: () => {},
  showSuccessToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"]) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const showCartToast = useCallback(
    (message: string) => addToast(message, "cart"),
    [addToast],
  );

  const showSuccessToast = useCallback(
    (message: string) => addToast(message, "success"),
    [addToast],
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showCartToast, showSuccessToast }}>
      {children}

      <div
        className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2"
        aria-live="polite"
        aria-label="Notificaciones"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 rounded-[20px] border border-primary/16 bg-[linear-gradient(180deg,rgba(14,18,28,0.97),rgba(8,11,18,0.97))] px-4 py-3 text-sm text-white shadow-[0_20px_48px_rgba(2,6,23,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
            >
              {toast.type === "cart" ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(180deg,rgba(236,212,171,0.9),rgba(208,170,103,0.9))]">
                  <ShoppingBag className="h-4 w-4 text-slate-900" />
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/20">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                </span>
              )}
              <span className="max-w-[260px] text-sm font-medium">{toast.message}</span>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="ml-1 shrink-0 text-slate-400 transition-colors hover:text-white"
                aria-label="Cerrar notificación"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
