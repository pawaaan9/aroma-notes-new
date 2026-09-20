"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { splitComboPrice, type ResolvedCombo } from "@/lib/combo-offers";
import { formatLkr } from "@/utils/currency";
import { safeImageUrl } from "@/utils/image";

function ComboCard({ combo }: { combo: ResolvedCombo }) {
  const { addCombo, hasCombo } = useCart();
  const { open } = useCartDrawer();
  const [added, setAdded] = useState(false);
  const inCart = hasCombo(combo.id);
  const count = combo.items.length;

  const handleAdd = () => {
    if (!combo.inStock) return;
    const shares = splitComboPrice(
      combo.items.map((it) => it.unitPrice),
      combo.comboPrice,
    );
    addCombo(
      combo.id,
      combo.name,
      combo.items.map((it, i) => ({
        // Distinct from the same product bought on its own, so the two never merge.
        id: `combo:${combo.id}:${it.product._id}:${it.size ?? "default"}`,
        name: it.product.name,
        imageUrl: it.imageUrl,
        brand: it.product.brand ?? null,
        size: it.size,
        price: shares[i],
        originalPrice: it.unitPrice,
        comboFreeDelivery: combo.freeDelivery,
      })),
      1,
    );
    setAdded(true);
    open();
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group relative">
      {/* Glow */}
      <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-amber-500/40 via-rose-500/30 to-amber-500/40 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-sm">
        {/* Ribbon */}
        {combo.savings > 0 && (
          <div className="absolute -right-12 top-7 z-20 rotate-45 bg-gradient-to-r from-amber-500 to-rose-500 px-14 py-1.5 text-center shadow-lg">
            <span className="font-saira text-[11px] font-bold uppercase tracking-wider text-white">
              Save {combo.savingsPercent}%
            </span>
          </div>
        )}

        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {/* Products */}
          <div className="relative border-b border-white/10 bg-black/20 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <p className="mb-5 text-center font-saira text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-400/80 lg:text-left">
              {count} piece set
            </p>

            <div className="flex flex-wrap items-start justify-center gap-y-5 lg:justify-start">
              {combo.items.map((item, i) => (
                <div key={`${item.product._id}-${i}`} className="flex items-center">
                  {i > 0 && (
                    <span className="mx-2 select-none font-saira text-xl font-light text-amber-400/50 sm:mx-3">
                      +
                    </span>
                  )}
                  <Link
                    href={`/product-view/${item.product.slug?.current ?? item.product._id}`}
                    className="block w-[92px] sm:w-[104px]"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-gray-900 transition-all duration-500 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10">
                      <Image
                        src={safeImageUrl(item.imageUrl)}
                        alt={item.product.name}
                        fill
                        sizes="104px"
                        quality={68}
                        className="object-cover transition-transform duration-700 hover:scale-110"
                      />
                      {!item.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                          <span className="font-saira text-[9px] font-bold uppercase tracking-wider text-rose-300">
                            Sold out
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-center font-saira text-[11px] font-semibold leading-tight text-white">
                      {item.product.name}
                    </p>
                    <p className="mt-0.5 text-center font-saira text-[10px] text-amber-400/70">
                      {item.size ?? "Standard"}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <h3 className="font-smooch text-2xl font-bold leading-tight text-white sm:text-3xl">
              {combo.name}
            </h3>
            {combo.description && (
              <p className="mt-2 font-saira text-sm leading-relaxed text-gray-400">
                {combo.description}
              </p>
            )}

            {combo.freeDelivery && (
              <div className="mt-4 inline-flex items-center gap-2 self-start rounded-full border border-sky-400/30 bg-sky-400/10 px-3.5 py-1.5">
                <svg className="h-3.5 w-3.5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                </svg>
                <span className="font-saira text-[11px] font-bold uppercase tracking-wider text-sky-300">
                  Free delivery
                </span>
              </div>
            )}

            {/* What you get */}
            <ul className="mt-5 space-y-1.5 border-t border-white/10 pt-5">
              {combo.items.map((item, i) => (
                <li
                  key={`row-${item.product._id}-${i}`}
                  className="flex items-baseline justify-between gap-3 font-saira text-xs"
                >
                  <span className="min-w-0 flex-1 truncate text-gray-300">
                    {item.product.name}
                    <span className="text-gray-500"> · {item.size ?? "Standard"}</span>
                  </span>
                  <span className="shrink-0 text-gray-500">{formatLkr(item.unitPrice)}</span>
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="mt-5 flex items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <p className="font-saira text-[10px] uppercase tracking-[0.2em] text-gray-500">
                  Bundle price
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-saira text-3xl font-bold text-white">
                    {formatLkr(combo.comboPrice)}
                  </span>
                  {combo.savings > 0 && (
                    <span className="font-saira text-sm text-gray-500 line-through">
                      {formatLkr(combo.originalTotal)}
                    </span>
                  )}
                </div>
              </div>
              {combo.savings > 0 && (
                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 text-right">
                  <p className="font-saira text-[10px] uppercase tracking-wider text-emerald-400/70">
                    You save
                  </p>
                  <p className="font-saira text-sm font-bold text-emerald-400">
                    {formatLkr(combo.savings)}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={handleAdd}
              disabled={!combo.inStock}
              className={`mt-5 inline-flex w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 font-saira text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                !combo.inStock
                  ? "cursor-not-allowed bg-white/10 text-gray-500"
                  : added
                    ? "bg-emerald-500 text-white"
                    : "bg-white text-gray-900 hover:bg-amber-300 hover:shadow-lg hover:shadow-amber-500/20"
              }`}
            >
              {!combo.inStock ? (
                "Currently unavailable"
              ) : added ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Added to cart
                </>
              ) : (
                <>
                  {inCart ? "Add another set" : `Get all ${count} for ${formatLkr(combo.comboPrice)}`}
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            <p className="mt-3 text-center font-saira text-[11px] text-gray-500">
              All {count} products ship together as one bundle
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComboOffers({ combos }: { combos: ResolvedCombo[] }) {
  if (combos.length === 0) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {combos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} />
      ))}
    </div>
  );
}
