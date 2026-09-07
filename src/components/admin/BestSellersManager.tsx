"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { fetchAllProducts } from "@/lib/firestore-products";
import {
  MAX_BEST_SELLERS,
  saveBestSellerIds,
  subscribeToBestSellerIds,
} from "@/lib/best-sellers";
import type { Product } from "@/types/product";
import { formatLkr } from "@/utils/currency";

function priceOf(product: Product): string {
  const target =
    product.variants?.find((v) => v.size?.toLowerCase().includes("100ml")) ??
    product.variants?.[0] ??
    null;
  const price = target?.discountPrice ?? target?.price ?? null;
  return price != null ? formatLkr(price) : "-";
}

export default function BestSellersManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    let first = true;
    const unsub = subscribeToBestSellerIds((ids) => {
      setSavedIds(ids);
      // Only adopt remote changes into the editor when we have no local edits.
      setSelectedIds((current) => (first || current.length === 0 ? ids : current));
      first = false;
    });
    return () => unsub();
  }, []);

  const productsById = useMemo(
    () => new Map(products.map((p) => [p._id, p])),
    [products],
  );

  const selected = useMemo(
    () => selectedIds.map((id) => productsById.get(id)).filter((p): p is Product => !!p),
    [selectedIds, productsById],
  );

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((p) => !selectedIds.includes(p._id))
      .filter((p) =>
        term
          ? `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(term)
          : true,
      )
      .slice(0, term ? 20 : 8);
  }, [products, selectedIds, search]);

  const dirty =
    selectedIds.length !== savedIds.length ||
    selectedIds.some((id, i) => savedIds[i] !== id);
  const isFull = selectedIds.length >= MAX_BEST_SELLERS;

  const add = (id: string) => {
    if (isFull) {
      setMessage({ type: "err", text: `You can feature up to ${MAX_BEST_SELLERS} products.` });
      return;
    }
    setMessage(null);
    setSelectedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  };

  const remove = (id: string) => {
    setMessage(null);
    setSelectedIds((ids) => ids.filter((x) => x !== id));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    setMessage(null);
    setSelectedIds((ids) => {
      const next = [...ids];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveBestSellerIds(selectedIds);
      setSavedIds(selectedIds);
      // Best effort: the home page also revalidates on its own every 2 minutes.
      await fetch("/api/best-sellers/revalidate", { method: "POST" }).catch(() => {});
      setMessage({ type: "ok", text: "Saved. The home page is updated." });
    } catch {
      setMessage({ type: "err", text: "Could not save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5l2.4 4.87 5.37.78-3.89 3.79.92 5.35-4.8-2.52-4.8 2.52.92-5.35-3.89-3.79 5.37-.78 2.4-4.87z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white font-saira">Best Selling Products</h2>
            <p className="text-xs text-gray-400 font-saira">
              Featured on the home page · {selectedIds.length}/{MAX_BEST_SELLERS} selected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {dirty && (
            <button
              type="button"
              onClick={() => { setSelectedIds(savedIds); setMessage(null); }}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-medium text-gray-300 font-saira transition-colors hover:bg-white/5"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-gray-900 font-saira transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
          >
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
        </div>
      </div>

      {message && (
        <p className={`mt-4 rounded-xl px-4 py-2.5 text-xs font-saira ${
          message.type === "ok"
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-rose-500/10 text-rose-400"
        }`}>
          {message.text}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Selected list */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-saira">
            Featured order
          </p>

          {selected.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-10 text-center">
              <p className="text-sm font-medium text-gray-400 font-saira">No best sellers yet</p>
              <p className="mt-1 text-xs text-gray-500 font-saira">
                Pick products from the list to feature them on the home page
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {selected.map((product, index) => (
                <li
                  key={product._id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-[11px] font-bold text-amber-400 font-saira">
                    {index + 1}
                  </span>
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-700">
                    {product.coverImageUrl && (
                      <Image
                        src={product.coverImageUrl}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white font-saira">{product.name}</p>
                    <p className="truncate text-xs text-gray-400 font-saira">
                      {product.brand ?? "-"} · {priceOf(product)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === selected.length - 1}
                      aria-label="Move down"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(product._id)}
                      aria-label="Remove"
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-rose-500/20 hover:text-rose-400"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Product picker */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500 font-saira">
            Add from catalog
          </p>

          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name or brand…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 font-saira outline-none transition-colors focus:border-amber-500/50"
            />
          </div>

          <div className="mt-3 max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="py-8 text-center text-xs text-gray-500 font-saira">Loading products…</p>
            ) : results.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-500 font-saira">
                {search ? "No matching products" : "All products are already featured"}
              </p>
            ) : (
              results.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => add(product._id)}
                  disabled={isFull}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-left transition-colors hover:border-amber-500/40 hover:bg-amber-500/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/10 disabled:hover:bg-white/[0.03]"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-700">
                    {product.coverImageUrl && (
                      <Image
                        src={product.coverImageUrl}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white font-saira">{product.name}</p>
                    <p className="truncate text-xs text-gray-400 font-saira">
                      {product.brand ?? "-"} · {priceOf(product)}
                    </p>
                  </div>
                  <span className="shrink-0 text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
              ))
            )}
          </div>

          {!search && !loading && products.length > results.length + selectedIds.length && (
            <p className="mt-2 text-[11px] text-gray-500 font-saira">
              Showing {results.length} of {products.length - selectedIds.length}. Search to find more.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
