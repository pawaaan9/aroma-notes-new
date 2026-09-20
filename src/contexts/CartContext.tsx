"use client";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  imageUrl?: string;
  brand?: string | null;
  size?: string | null;
  /** For a combo line this is the item's share of the combo price. */
  price?: number | null;
  /** What the item costs on its own, used to show the saving. */
  originalPrice?: number | null;
  quantity: number;
  /** Set on every line that came from the same combo offer. */
  comboId?: string | null;
  comboName?: string | null;
  /** True when the combo this line belongs to waives delivery. */
  comboFreeDelivery?: boolean;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  originalTotal: number;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  addCombo: (comboId: string, comboName: string, lines: Omit<CartItem, "quantity">[], qty?: number) => void;
  updateQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  updateComboQuantity: (comboId: string, qty: number) => void;
  removeCombo: (comboId: string) => void;
  hasItem: (id: string) => boolean;
  hasCombo: (comboId: string) => boolean;
  /** True when any combo in the cart waives the delivery charge. */
  hasFreeDelivery: boolean;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "aroma-notes:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: CartItem[] = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch { /* give up */ }
      }
    });
    return () => cancelAnimationFrame(id);
  }, [items]);

  const addItem: CartContextValue["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      const addQty = Math.max(1, qty);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + addQty };
        return next;
      }
      return [...prev, { ...item, quantity: addQty }];
    });
  };

  /**
   * Adds every product in a combo as its own line, tagged with the combo id.
   * Each line carries its share of the combo price, so the cart total, the
   * order and the invoice all add up without special casing combos.
   */
  const addCombo: CartContextValue["addCombo"] = (comboId, comboName, lines, qty = 1) => {
    const addQty = Math.max(1, qty);
    setItems((prev) => {
      const existing = prev.some((p) => p.comboId === comboId);
      if (existing) {
        return prev.map((p) =>
          p.comboId === comboId ? { ...p, quantity: p.quantity + addQty } : p,
        );
      }
      return [
        ...prev,
        ...lines.map((line) => ({
          ...line,
          comboId,
          comboName,
          quantity: addQty,
        })),
      ];
    });
  };

  const updateComboQuantity: CartContextValue["updateComboQuantity"] = (comboId, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.comboId !== comboId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.comboId === comboId ? { ...i, quantity: qty } : i)),
    );
  };

  const removeCombo: CartContextValue["removeCombo"] = (comboId) => {
    setItems((prev) => prev.filter((i) => i.comboId !== comboId));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (id, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    );
  };

  const removeItem: CartContextValue["removeItem"] = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const hasItem: CartContextValue["hasItem"] = (id) => items.some((i) => i.id === id);

  const hasCombo: CartContextValue["hasCombo"] = (comboId) =>
    items.some((i) => i.comboId === comboId);

  const clear = () => setItems([]);

  const value: CartContextValue = useMemo(() => ({
    items,
    count: items.reduce((n, it) => n + it.quantity, 0),
    total: items.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0),
    originalTotal: items.reduce((sum, it) => sum + (it.originalPrice ?? it.price ?? 0) * it.quantity, 0),
    addItem,
    addCombo,
    updateQuantity,
    removeItem,
    updateComboQuantity,
    removeCombo,
    hasItem,
    hasCombo,
    hasFreeDelivery: items.some((it) => it.comboFreeDelivery === true),
    clear,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [items]);

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}


