"use client";
import { useMemo, useState } from "react";
import type { SanityVariant } from "@/lib/sanity";
import { formatLkr } from "@/utils/currency";

type VariantSelectorProps = {
  variants: SanityVariant[];
  value?: number;
  onChange?: (index: number) => void;
};

export default function VariantSelector({ variants, value, onChange }: VariantSelectorProps) {
  const inOrder = useMemo(() => [...variants], [variants]);
  const [internalIdx, setInternalIdx] = useState(-1);
  const selectedIdx = typeof value === 'number' ? value : internalIdx;
  const selected = selectedIdx >= 0 ? inOrder[selectedIdx] ?? null : null;
  const price = selected ? (selected.discountPrice ?? selected.price ?? null) : null;
  const hasDiscount = !!selected && typeof selected.discountPrice === 'number' && typeof selected.price === 'number' && selected.discountPrice < selected.price;

  return (
    <div className="font-saira">
      <div className="flex flex-wrap gap-2">
        {inOrder.map((v, i) => {
          const isActive = i === selectedIdx;
          const isOut = v.inStock === false;
          return (
            <button
              key={i}
              type="button"
              disabled={isOut}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                isActive
                  ? "border-primary text-primary bg-primary/10"
                  : isOut
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
              onClick={() => {
                setInternalIdx(i);
                onChange?.(i);
              }}
            >
              {v.size}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {(() => {
          if (selected) {
            return (
              <span className={`text-sm font-medium ${selected.inStock === false ? "text-red-600" : "text-green-600"}`}>
                {selected.inStock === false ? "Out of stock" : "In stock"}
              </span>
            );
          }
          const allOut = inOrder.length > 0 && inOrder.every((v) => v.inStock === false);
          return allOut ? (
            <span className="text-sm font-medium text-red-600">Out of stock</span>
          ) : null;
        })()}
      </div>
      {price != null ? (
        <div className="mt-2">
          <p className="text-xl font-bold text-primary">
            {formatLkr(price)}
            {hasDiscount && selected?.price != null ? (
              <span className="ml-2 text-base font-normal text-gray-500 line-through">{formatLkr(selected.price)}</span>
            ) : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}


