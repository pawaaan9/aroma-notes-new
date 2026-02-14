"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatLkr } from "@/utils/currency";
import { fetchSettings } from "@/lib/settings";

export default function CartPage() {
  const { items, count, total, updateQuantity, removeItem, clear } = useCart();
  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState<number | null>(null);

  // Fetch delivery fee from Firestore
  useEffect(() => {
    fetchSettings().then((s) => setDeliveryFeeConfig(s.deliveryFee));
  }, []);

  const DELIVERY_FEE = deliveryFeeConfig ?? 350; // fallback while loading
  const deliveryFee = total > 0 ? DELIVERY_FEE : 0;
  const grandTotal = total + deliveryFee;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" dark />
      </div>

      <main className="flex-grow bg-white pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 font-saira">Your Cart</h1>
            <p className="mt-1 text-sm text-gray-500 font-saira">
              {count === 0
                ? "Your cart is empty"
                : `${count} item${count > 1 ? "s" : ""} in your cart`}
            </p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
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
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-saira font-semibold text-white transition-all hover:bg-primary/90 hover:scale-105"
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
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Product image */}
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
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
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 font-saira line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-saira">
                          {item.brand ?? ""}{item.size ? ` • ${item.size}` : ""}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="min-w-[2rem] text-center font-semibold text-gray-900 font-saira">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-100"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Price + remove */}
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900 font-saira">
                            {typeof item.price === "number"
                              ? formatLkr(item.price * item.quantity)
                              : "—"}
                          </span>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 transition-colors hover:text-rose-600"
                            aria-label="Remove item"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

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
                <div className="sticky top-28 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 font-saira">Order Summary</h2>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm font-saira">
                      <span className="text-gray-600">Subtotal ({count} items)</span>
                      <span className="font-medium text-gray-900">{formatLkr(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-saira">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-gray-900">{formatLkr(deliveryFee)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-saira">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-primary">{formatLkr(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-saira font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
                  >
                    Proceed to Checkout
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  <Link
                    href="/products"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-saira font-medium text-gray-700 transition-all hover:bg-gray-100"
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
