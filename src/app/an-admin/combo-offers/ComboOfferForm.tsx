"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Product } from "@/types/product";
import {
  COMBO_MAX_ITEMS,
  COMBO_MIN_ITEMS,
  createComboOffer,
  updateComboOffer,
  unitPriceOf,
  type ComboOffer,
  type ComboOfferItem,
} from "@/lib/combo-offers";
import { formatLkr } from "@/utils/currency";

type Slot = ComboOfferItem;

export default function ComboOfferForm({
  products,
  editing,
  onClose,
  onSaved,
}: {
  products: Product[];
  editing: ComboOffer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [active, setActive] = useState(editing?.active ?? true);
  const [freeDelivery, setFreeDelivery] = useState(editing?.freeDelivery ?? false);
  const [comboPrice, setComboPrice] = useState<string>(
    editing?.comboPrice ? String(editing.comboPrice) : "",
  );
  const [slots, setSlots] = useState<Slot[]>(
    editing?.items?.length ? editing.items : [],
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productsById = useMemo(
    () => new Map(products.map((p) => [p._id, p])),
    [products],
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => term ? `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(term) : true)
      .slice(0, term ? 20 : 6);
  }, [products, search]);

  const originalTotal = slots.reduce((sum, s) => {
    const p = productsById.get(s.productId);
    return sum + (p ? unitPriceOf(p, s.size) : 0);
  }, 0);

  const priceNumber = Number(comboPrice) || 0;
  const savings = Math.max(0, originalTotal - priceNumber);
  const savingsPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;
  const isFull = slots.length >= COMBO_MAX_ITEMS;

  const addSlot = (product: Product) => {
    if (isFull) return;
    const firstSize = product.variants?.[0]?.size ?? null;
    setSlots((prev) => [...prev, { productId: product._id, size: firstSize }]);
    setSearch("");
    setError(null);
  };

  const setSlotSize = (index: number, size: string | null) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, size } : s)));
  };

  const removeSlot = (index: number) => {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Give the combo a name.");
      return;
    }
    if (slots.length < COMBO_MIN_ITEMS) {
      setError(`Pick at least ${COMBO_MIN_ITEMS} products.`);
      return;
    }
    if (priceNumber <= 0) {
      setError("Enter the combo price.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        items: slots,
        comboPrice: priceNumber,
        freeDelivery,
        active,
      };
      if (editing) {
        await updateComboOffer(editing.id, payload);
      } else {
        await createComboOffer(payload);
      }
      await fetch("/api/combo-offers/revalidate", { method: "POST" }).catch(() => {});
      onSaved();
    } catch (err) {
      console.error("Failed to save combo:", err);
      setError("Could not save the combo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white font-saira">
              {editing ? "Edit Combo Offer" : "New Combo Offer"}
            </h2>
            <p className="text-xs text-gray-400 font-saira">
              Pick {COMBO_MIN_ITEMS} to {COMBO_MAX_ITEMS} products with their sizes, then set one price for the bundle
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Name + description */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400 font-saira">
                Combo name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Shah Rukh Khan Signature Layering"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-500 font-saira outline-none transition-colors focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400 font-saira">
                Tagline (optional)
              </label>
              <input
                value={description ?? ""}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Class. Warmth. Sophistication."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-500 font-saira outline-none transition-colors focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Chosen products */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-saira">
              In this combo ({slots.length}/{COMBO_MAX_ITEMS})
            </p>

            {slots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 py-8 text-center">
                <p className="text-sm text-gray-400 font-saira">No products picked yet</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {slots.map((slot, index) => {
                  const product = productsById.get(slot.productId);
                  if (!product) {
                    return (
                      <li key={`${slot.productId}-${index}`} className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                        <span className="text-sm text-red-400 font-saira">
                          Product no longer exists
                        </span>
                        <button onClick={() => removeSlot(index)} className="text-xs text-red-400 underline font-saira">
                          Remove
                        </button>
                      </li>
                    );
                  }
                  const variants = product.variants ?? [];
                  return (
                    <li key={`${slot.productId}-${index}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                        {product.coverImageUrl && (
                          <Image src={product.coverImageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white font-saira">{product.name}</p>
                        <p className="truncate text-xs text-gray-400 font-saira">{product.brand ?? "No brand"}</p>
                      </div>

                      <div className="relative">
                        <select
                          value={slot.size ?? ""}
                          onChange={(e) => setSlotSize(index, e.target.value || null)}
                          className="w-full appearance-none rounded-lg border border-white/10 bg-gray-800 py-2 pl-3 pr-9 text-xs text-white font-saira outline-none focus:border-amber-500/50"
                        >
                          {variants.length === 0 && <option value="">No sizes</option>}
                          {variants.map((v, vi) => (
                            <option key={`${v.size}-${vi}`} value={v.size ?? ""}>
                              {v.size || "Default"}
                              {v.inStock === false ? " (out of stock)" : ""}
                            </option>
                          ))}
                        </select>
                        <svg
                          className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2.2}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>

                      <span className="w-24 text-right text-sm font-semibold text-gray-300 font-saira">
                        {formatLkr(unitPriceOf(product, slot.size))}
                      </span>

                      <button
                        onClick={() => removeSlot(index)}
                        aria-label="Remove from combo"
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Product picker */}
          {!isFull && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-saira">
                Add a product
              </p>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or brand..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder-gray-500 font-saira outline-none transition-colors focus:border-amber-500/50"
              />
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {results.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addSlot(product)}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left transition-colors hover:border-amber-500/40 hover:bg-amber-500/5"
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-800">
                      {product.coverImageUrl && (
                        <Image src={product.coverImageUrl} alt={product.name} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white font-saira">{product.name}</p>
                      <p className="truncate text-[11px] text-gray-400 font-saira">{product.brand ?? "No brand"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-400 font-saira">
                  Combo price (LKR)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={comboPrice}
                  onChange={(e) => setComboPrice(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="4900"
                  className="w-full rounded-xl border border-white/10 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 font-saira outline-none transition-colors focus:border-amber-500/50"
                />
              </div>
              <div className="flex flex-col justify-center gap-1 text-sm font-saira">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Bought separately</span>
                  <span className="text-gray-300">{formatLkr(originalTotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Customer saves</span>
                  <span className={savings > 0 ? "font-semibold text-emerald-400" : "text-gray-500"}>
                    {formatLkr(savings)} {savings > 0 ? `(${savingsPercent}%)` : ""}
                  </span>
                </div>
              </div>
            </div>

            {priceNumber > originalTotal && originalTotal > 0 && (
              <p className="mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-400 font-saira">
                This combo costs more than buying the products separately.
              </p>
            )}

            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={freeDelivery}
                onChange={(e) => setFreeDelivery(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-amber-500"
              />
              <span className="text-sm text-gray-300 font-saira">
                Free delivery with this combo
                <span className="mt-0.5 block text-xs text-gray-500">
                  Delivery is charged at zero whenever this combo is in the cart
                </span>
              </span>
            </label>

            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm text-gray-300 font-saira">
                Show this combo on the website
              </span>
            </label>
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-400 font-saira">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-60 font-saira"
          >
            {saving ? "Saving..." : editing ? "Save changes" : "Create combo"}
          </button>
        </div>
      </div>
    </div>
  );
}
