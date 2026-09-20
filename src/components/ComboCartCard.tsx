"use client";

import Image from "next/image";
import { formatLkr } from "@/utils/currency";
import { safeImageUrl } from "@/utils/image";
import type { CartGroup } from "@/utils/cart-groups";

/**
 * One combo shown as a single row in the cart. Quantity and removal apply to
 * the whole bundle, because its products are only discounted together.
 */
export default function ComboCartCard({
  group,
  onQuantity,
  onRemove,
}: {
  group: Extract<CartGroup, { kind: "combo" }>;
  onQuantity: (comboId: string, qty: number) => void;
  onRemove: (comboId: string) => void;
}) {
  const savings = Math.max(0, group.setOriginalPrice - group.setPrice);

  return (
    <div className="rounded-xl border-2 border-amber-300 bg-amber-50/40 p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Combo header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-1">
            <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
            </svg>
            <span className="font-saira text-[10px] font-bold uppercase tracking-wider text-white">
              Combo
            </span>
          </span>
          <h3 className="truncate font-saira font-semibold text-gray-900">{group.comboName}</h3>
        </div>
        <button
          onClick={() => onRemove(group.comboId)}
          className="shrink-0 text-gray-400 transition-colors hover:text-rose-600"
          aria-label="Remove combo"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Products in the bundle */}
      <div className="space-y-2">
        {group.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg bg-white/80 p-2">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              {item.imageUrl ? (
                <Image
                  src={safeImageUrl(item.imageUrl)}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-saira text-sm font-medium text-gray-900">{item.name}</p>
              <p className="truncate font-saira text-xs text-gray-500">
                {item.brand ?? ""}{item.size ? ` • ${item.size}` : ""}
              </p>
            </div>
            {typeof item.originalPrice === "number" && (
              <span className="shrink-0 font-saira text-xs text-gray-400 line-through">
                {formatLkr(item.originalPrice)}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Quantity and price */}
      <div className="mt-3 flex items-center justify-between border-t border-amber-200 pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantity(group.comboId, group.quantity - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Fewer combos"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>
          <span className="min-w-[2rem] text-center font-saira font-semibold text-gray-900">
            {group.quantity}
          </span>
          <button
            onClick={() => onQuantity(group.comboId, group.quantity + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="More combos"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="text-right">
          <div className="flex items-baseline gap-2">
            {savings > 0 && (
              <span className="font-saira text-xs text-gray-400 line-through">
                {formatLkr(group.setOriginalPrice * group.quantity)}
              </span>
            )}
            <span className="font-saira font-bold text-gray-900">
              {formatLkr(group.setPrice * group.quantity)}
            </span>
          </div>
          {savings > 0 && (
            <p className="font-saira text-xs font-semibold text-emerald-600">
              You save {formatLkr(savings * group.quantity)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
