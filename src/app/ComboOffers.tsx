"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useCartDrawer } from "@/contexts/CartDrawerContext";
import { splitComboPrice, type ResolvedCombo } from "@/lib/combo-offers";
import { formatLkr } from "@/utils/currency";
import { safeImageUrl } from "@/utils/image";

function ComboCard({ combo, index }: { combo: ResolvedCombo; index: number }) {
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
    <div className="group grid border border-white/15 bg-black transition-colors duration-300 hover:border-primary lg:grid-cols-[110px_1fr_380px]">
      {/* Index */}
      <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 lg:flex-col lg:justify-center lg:gap-4 lg:border-b-0 lg:border-r lg:px-0 lg:py-8">
        <span className="text-outline text-5xl font-black leading-none text-white lg:text-6xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary lg:[writing-mode:vertical-rl] lg:rotate-180">
          {count} Piece Set
        </span>
      </div>

      {/* Products */}
      <div className="flex items-center justify-center p-5 sm:p-8">
        <div className="flex w-full items-stretch" style={{ maxWidth: count * 240 }}>
        {combo.items.map((item, i) => (
          <div key={`${item.product._id}-${i}`} className="relative flex min-w-0 flex-1">
            {i > 0 && (
              <span className="absolute left-0 top-[38%] z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-primary text-lg font-black text-white sm:h-10 sm:w-10">
                +
              </span>
            )}
            <Link
              href={`/product-view/${item.product.slug?.current ?? item.product._id}`}
              className="block min-w-0 flex-1"
            >
              <div className={`relative aspect-square w-full overflow-hidden border border-white/15 bg-gray-900 ${i > 0 ? "border-l-0" : ""}`}>
                <Image
                  src={safeImageUrl(item.imageUrl)}
                  alt={item.product.name}
                  fill
                  sizes="(min-width: 1024px) 240px, 45vw"
                  quality={68}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Sold out</span>
                  </div>
                )}
              </div>
              <div className={`border border-t-0 border-white/15 px-3 py-2.5 ${i > 0 ? "border-l-0" : ""}`}>
                <p className="truncate text-xs font-bold text-white sm:text-sm">{item.product.name}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                  {item.size ?? "Standard"}
                </p>
              </div>
            </Link>
          </div>
        ))}
        </div>
      </div>

      {/* Price panel */}
      <div className="flex flex-col bg-white p-6 text-gray-900 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow text-gray-500">Bundle Offer</p>
          {combo.savings > 0 && (
            <span className="bg-primary px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
              Save {combo.savingsPercent}%
            </span>
          )}
        </div>
        <h3 className="mt-3 text-2xl font-black uppercase leading-tight tracking-tight">{combo.name}</h3>
        {combo.description && (
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{combo.description}</p>
        )}
        {combo.freeDelivery && (
          <p className="mt-4 flex items-center gap-2 self-start border border-gray-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em]">
            <span className="h-1.5 w-1.5 bg-primary" />
            Free delivery
          </p>
        )}

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-4 border-t border-gray-200 pt-5">
            <div>
              {combo.savings > 0 && (
                <p className="text-sm text-gray-400 line-through">{formatLkr(combo.originalTotal)}</p>
              )}
              <p className="text-3xl font-black leading-none">{formatLkr(combo.comboPrice)}</p>
            </div>
            {combo.savings > 0 && (
              <p className="text-right text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                You save
                <br />
                <span className="text-sm">{formatLkr(combo.savings)}</span>
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!combo.inStock}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
              !combo.inStock
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : added
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-900 text-white hover:bg-primary"
            }`}
          >
            {!combo.inStock ? (
              "Currently unavailable"
            ) : added ? (
              "Added to cart"
            ) : (
              <>
                {inCart ? "Add another set" : "Add bundle to cart"}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-gray-500">
            All {count} products ship together as one bundle
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ComboOffers({ combos }: { combos: ResolvedCombo[] }) {
  if (combos.length === 0) return null;

  return (
    <div className="space-y-6">
      {combos.map((combo, index) => (
        <div key={combo.id} data-reveal>
          <ComboCard combo={combo} index={index} />
        </div>
      ))}
    </div>
  );
}
