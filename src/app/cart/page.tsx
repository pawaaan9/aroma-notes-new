"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatLkr } from "@/utils/currency";
import { loadSettings } from "@/lib/settings";
import { safeImageUrl } from "@/utils/image";
import { groupCartItems } from "@/utils/cart-groups";
import ComboCartCard from "@/components/ComboCartCard";

export default function CartPage() {
  const { items, count, total, updateQuantity, removeItem, updateComboQuantity, removeCombo, hasFreeDelivery, clear } = useCart();
  const groups = groupCartItems(items);
  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState<number | null>(null);

  useEffect(() => {
    const unsub = loadSettings((s) => setDeliveryFeeConfig(s.deliveryFee));
    return () => unsub();
  }, []);

  const settingsReady = deliveryFeeConfig !== null;
  const DELIVERY_FEE = deliveryFeeConfig ?? 0;
  const deliveryFee = total > 0 && !hasFreeDelivery ? DELIVERY_FEE : 0;
  const grandTotal = total + deliveryFee;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" />
      </div>

      <main className="flex-grow bg-white pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold uppercase tracking-[0.06em] text-gray-900">Your Cart</h1>
            <p className="mt-1 text-sm text-gray-500 font-saira">
              {count === 0
                ? "Your cart is empty"
                : `${count} item${count > 1 ? "s" : ""} in your cart`}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 flex h-24 w-24 items-center justify-center bg-gray-100">
                <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700 font-saira">Your cart is empty</p>
              <p className="mt-1 text-sm text-gray-500 font-saira">
                Browse our products and add some fragrances!
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 bg-primary px-6 py-3 font-saira font-semibold text-white transition-all hover:bg-primary/90"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {groups.map((group) => {
                  if (group.kind === "combo") {
                    return (
                      <ComboCartCard
                        key={group.key}
                        group={group}
                        onQuantity={updateComboQuantity}
                        onRemove={removeCombo}
                      />
                    );
                  }
                  const item = group.item;
                  return (
                  <div
                    key={group.key}
                    className="flex gap-3 border border-gray-200 bg-white p-3 sm:gap-4 sm:p-4"
                  >
                    {/* Product image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-gray-100 border border-gray-200">
                      {item.imageUrl ? (
                        <Image
                          src={safeImageUrl(item.imageUrl)}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Item details */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 font-bold leading-snug text-gray-900">{item.name}</h3>
                          <p className="mt-0.5 truncate text-xs capitalize text-gray-500">
                            {item.brand ?? ""}{item.size ? ` · ${item.size}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="-mr-1 -mt-1 shrink-0 p-1 text-gray-400 transition-colors hover:text-rose-600"
                          aria-label="Remove item"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                            <path strokeLinecap="square" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        {/* Quantity stepper */}
                        <div className="flex h-9 items-stretch border border-gray-300">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                            aria-label="Decrease quantity"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="square" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="flex w-9 items-center justify-center border-x border-gray-300 text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-100"
                            aria-label="Increase quantity"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="square" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <span className="whitespace-nowrap text-base font-black text-gray-900">
                          {typeof item.price === "number" ? formatLkr(item.price * item.quantity) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
                })}

                {/* Clear cart */}
                <button
                  onClick={() => clear()}
                  className="mt-2 text-sm font-medium text-gray-500 transition-colors hover:text-rose-600 font-saira"
                >
                  Clear entire cart
                </button>
              </div>

              {/* Order summary sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-gray-900">Order Summary</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm font-saira">
                      <span className="text-gray-600">Subtotal ({count} items)</span>
                      <span className="font-medium text-gray-900">{formatLkr(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-saira">
                      <span className="text-gray-600">Delivery</span>
                      {settingsReady || hasFreeDelivery ? (
                        hasFreeDelivery ? (
                          <span className="font-semibold text-emerald-600">FREE</span>
                        ) : (
                          <span className="font-medium text-gray-900">{formatLkr(deliveryFee)}</span>
                        )
                      ) : (
                        <span className="inline-block h-4 w-16 animate-pulse bg-gray-200" />
                      )}
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-saira">
                        <span className="font-semibold text-gray-900">Total</span>
                        {settingsReady ? (
                          <span className="text-lg font-bold text-primary">{formatLkr(grandTotal)}</span>
                        ) : (
                          <span className="inline-block h-5 w-20 animate-pulse bg-gray-200" />
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 flex w-full items-center justify-center gap-2.5 bg-gray-900 py-3.5 font-saira text-sm font-semibold tracking-wide text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg"
                  >
                    Proceed to Checkout
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <Link
                    href="/products"
                    className="mt-2.5 flex w-full items-center justify-center gap-2 py-3 font-saira text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
