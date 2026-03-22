"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { fetchAllProducts } from "@/lib/firestore-products";
import { formatLkr } from "@/utils/currency";
import type { Product } from "@/types/product";

export default function CartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items, count, total, removeItem, clear } = useCart();
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen && items.length > 0) {
      fetchAllProducts().then((all) => {
        const cartIds = new Set(items.map((i) => i.id.split(":")[0]));
        const suggested = all
          .filter((p) => !cartIds.has(p._id))
          .slice(0, 4);
        setSuggestions(suggested);
      }).catch(console.error);
    } else {
      setSuggestions([]);
    }
  }, [isOpen, items]);

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
      {/* Backdrop - blur on left shows content */}
      <div
        className="fixed inset-0 z-[200] bg-black/25 backdrop-blur-md transition-opacity"
        onClick={close}
        aria-hidden
      />

      {/* Drawer panel - slides from right, flush right, free space on left */}
      <div
        className="fixed top-0 right-0 bottom-0 z-[201] w-[min(85vw,380px)] bg-white shadow-2xl flex flex-col rounded-tl-2xl rounded-bl-2xl overflow-hidden animate-slide-in-right"
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

        {/* Footer - suggestions, totals & actions */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-4 shrink-0 space-y-3">
            {/* Suggestions - above subtotal */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-wider text-gray-600 uppercase mb-2">You may also like</p>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {suggestions.map((p) => {
                    const imageSrc = p.coverImageUrl ?? p.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp";
                    const href = `/product-view/${p.slug?.current ?? p._id}`;
                    const price = p.variants?.[0]?.discountPrice ?? p.variants?.[0]?.price;
                    return (
                      <Link
                        key={p._id}
                        href={href}
                        onClick={close}
                        className="flex-shrink-0 w-20 group"
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image
                            src={imageSrc}
                            alt={p.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-gray-900 truncate mt-1">{p.name}</p>
                        {price != null && (
                          <p className="text-[10px] font-semibold text-primary">{formatLkr(price)}</p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1 text-sm font-saira">
              <div className="flex justify-between text-base font-bold text-gray-900">
                <span>Subtotal</span>
                <span>{formatLkr(total)}</span>
              </div>
            </div>
            <div className="space-y-2">
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

            <Link
              href="/checkout"
              onClick={close}
              className="block w-full py-3 px-4 rounded-lg bg-gray-900 text-white font-saira font-semibold text-center hover:bg-gray-800 transition-colors uppercase"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
