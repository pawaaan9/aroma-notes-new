"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { fetchSettings } from "@/lib/settings";
import { formatLkr } from "@/utils/currency";

export default function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items, count, total, removeItem, clear } = useCart();
  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState<number | null>(null);

  useEffect(() => {
    fetchSettings().then((s) => setDeliveryFeeConfig(s.deliveryFee));
  }, []);

  const DELIVERY_FEE = deliveryFeeConfig ?? 350;
  const deliveryFee = total > 0 ? DELIVERY_FEE : 0;
  const grandTotal = total + deliveryFee;

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) {
      document.addEventListener("keydown", onEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={close}
        aria-hidden
      />

      {/* Drawer panel - slides from right */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[201] w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-lg font-bold font-saira uppercase text-gray-900">
            Your Cart
            {count > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({count} item{count !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button
            onClick={close}
            className="p-2 -m-2 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-600 font-saira">Your cart is empty.</p>
              <Link
                href="/products"
                onClick={close}
                className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gray-900 text-white font-saira font-medium hover:bg-gray-800 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-200">
                    {it.imageUrl ? (
                      <Image
                        src={it.imageUrl}
                        alt={it.name}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{it.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {it.brand ?? ""} {it.size ? `• ${it.size}` : ""}
                    </p>
                    {typeof it.price === "number" && (
                      <p className="text-xs font-medium text-gray-700 mt-0.5">
                        {formatLkr(it.price)} × {it.quantity}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(it.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - totals & actions */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-4 shrink-0 space-y-3">
            <div className="space-y-1 text-sm font-saira">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatLkr(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{formatLkr(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                <span>Total</span>
                <span>{formatLkr(grandTotal)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={close}
                className="block w-full py-3 px-4 rounded-lg bg-gray-900 text-white font-saira font-semibold text-center hover:bg-gray-800 transition-colors uppercase"
              >
                Checkout
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={close}
                  className="py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-saira font-medium text-center text-sm hover:bg-gray-50 transition-colors"
                >
                  View Cart
                </Link>
                <button
                  onClick={() => clear()}
                  className="py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-saira font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
