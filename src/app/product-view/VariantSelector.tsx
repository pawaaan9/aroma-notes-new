"use client";
import type { ProductVariant as SanityVariant } from "@/types/product";
import { formatLkr } from "@/utils/currency";

type VariantSelectorProps = {
  variants: SanityVariant[];
  value: number;
  onChange: (index: number) => void;
};

/** Size options as boxed tiles, each showing its own price. */
export default function VariantSelector({ variants, value, onChange }: VariantSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {variants.map((v, i) => {
        const isActive = i === value;
        const isOut = v.inStock === false;
        const price = v.discountPrice ?? v.price ?? null;
        return (
          <button
            key={i}
            type="button"
            disabled={isOut}
            aria-pressed={isActive}
            onClick={() => onChange(i)}
            className={`relative border px-3 py-3 text-left transition-colors ${
              isActive
                ? "border-gray-900 bg-gray-900 text-white"
                : isOut
                  ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-300 text-gray-900 hover:border-gray-900"
            }`}
          >
            {isActive && <span className="absolute right-0 top-0 h-2.5 w-2.5 bg-primary" />}
            <span className={`block text-sm font-bold ${isOut ? "line-through" : ""}`}>{v.size}</span>
            <span className={`mt-0.5 block text-xs ${isActive ? "text-gray-300" : "text-gray-500"}`}>
              {isOut ? "Sold out" : price != null ? formatLkr(price) : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
