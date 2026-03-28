"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { adaptStoredCartItems, buildCartSummary } from "@/lib/adapters";
import type { CartItem, CartSummary } from "@/types/contracts";
import type { StoredCartItem, StoredCartItemSnapshot } from "@/types/store";

const STORAGE_KEY = "elitepull-cart";

type CartContextValue = {
  rawItems: StoredCartItem[];
  items: CartItem[];
  summary: CartSummary;
  totalItems: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number, snapshot?: StoredCartItemSnapshot) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [rawItems, setRawItems] = useState<StoredCartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredCartItem[];
      if (Array.isArray(parsed)) {
        setRawItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rawItems));
  }, [rawItems]);

  const items = adaptStoredCartItems(rawItems);
  const summary = buildCartSummary(items);
  const totalItems = summary.itemCount;
  const subtotal = summary.subtotal;

  function addItem(
    productId: string,
    quantity = 1,
    snapshot?: StoredCartItemSnapshot,
  ) {
    setRawItems((current) => {
      const existing = current.find((item) => item.productId === productId);

      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: item.quantity + quantity,
                snapshot: snapshot ?? item.snapshot,
              }
            : item,
        );
      }

      return [...current, { productId, quantity, snapshot }];
    });
  }

  function removeItem(productId: string) {
    setRawItems((current) => current.filter((item) => item.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setRawItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  }

  function clearCart() {
    setRawItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        rawItems,
        items,
        summary,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
