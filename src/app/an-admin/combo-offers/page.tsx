"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { fetchAllProducts } from "@/lib/firestore-products";
import {
  deleteComboOffer,
  migrateLegacyCombos,
  subscribeToComboOffers,
  unitPriceOf,
  updateComboOffer,
  type ComboOffer,
} from "@/lib/combo-offers";
import type { Product } from "@/types/product";
import { formatLkr } from "@/utils/currency";
import ComboOfferForm from "./ComboOfferForm";

export default function ComboOffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ComboOffer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ComboOffer | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch(() => setProducts([]));

    // Carries over combos saved before they moved into the settings document.
    migrateLegacyCombos()
      .then((n) => { if (n > 0) fetch("/api/combo-offers/revalidate", { method: "POST" }).catch(() => {}); })
      .catch(() => {});

    const unsub = subscribeToComboOffers((data) => {
      setOffers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const productsById = useMemo(
    () => new Map(products.map((p) => [p._id, p])),
    [products],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return offers;
    return offers.filter((offer) => {
      if (`${offer.name} ${offer.description ?? ""}`.toLowerCase().includes(term)) return true;
      return offer.items.some((it) => {
        const product = productsById.get(it.productId);
        if (!product) return false;
        return `${product.name} ${product.brand ?? ""}`.toLowerCase().includes(term);
      });
    });
  }, [offers, search, productsById]);

  const revalidate = () =>
    fetch("/api/combo-offers/revalidate", { method: "POST" }).catch(() => {});

  const toggleActive = async (offer: ComboOffer) => {
    setBusy(offer.id);
    try {
      await updateComboOffer(offer.id, {
        name: offer.name,
        description: offer.description ?? null,
        items: offer.items,
        comboPrice: offer.comboPrice,
        freeDelivery: offer.freeDelivery,
        active: !offer.active,
      });
      await revalidate();
    } catch (err) {
      console.error("Failed to toggle combo:", err);
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setBusy(deleteTarget.id);
    try {
      await deleteComboOffer(deleteTarget.id);
      await revalidate();
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete combo:", err);
    } finally {
      setBusy(null);
    }
  };

  const openNew = () => { setEditing(null); setShowForm(true); };
  const openEdit = (offer: ComboOffer) => { setEditing(offer); setShowForm(true); };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18.75a.375.375 0 00.375-.375V9.375a.375.375 0 00-.375-.375H3.375A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Combo Offers</h1>
            <p className="text-sm text-white/70 font-saira">
              Bundle products together at one special price
            </p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Action Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:shadow-xl font-saira"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Combo
        </button>
      </div>

      {/* Search */}
      {offers.length > 0 && (
        <div className="mt-6 flex justify-end">
          <div className="relative w-full sm:w-72">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search combos or products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-gray-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
            />
          </div>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-800">
              <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400 font-saira">
              {offers.length === 0 ? "No combo offers yet" : "No matching combos"}
            </p>
            <p className="mt-1 text-xs text-gray-500 font-saira">
              {offers.length === 0
                ? "Create one to show a bundle deal on the website"
                : "Try a different product or combo name"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map((offer) => {
              const resolved = offer.items.map((it) => ({
                slot: it,
                product: productsById.get(it.productId) ?? null,
              }));
              const originalTotal = resolved.reduce(
                (sum, r) => sum + (r.product ? unitPriceOf(r.product, r.slot.size) : 0),
                0,
              );
              const savings = Math.max(0, originalTotal - offer.comboPrice);
              const missing = resolved.some((r) => !r.product);

              return (
                <div key={offer.id} className="rounded-2xl border border-white/10 bg-gray-800/50 p-5 backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-white font-saira">{offer.name}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-saira ${
                          offer.active
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-gray-600/30 text-gray-400"
                        }`}>
                          {offer.active ? "Live" : "Hidden"}
                        </span>
                        {offer.freeDelivery && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-400 font-saira">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
                            </svg>
                            Free delivery
                          </span>
                        )}
                      </div>
                      {offer.description && (
                        <p className="mt-1 truncate text-xs text-gray-400 font-saira">{offer.description}</p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => toggleActive(offer)}
                        disabled={busy === offer.id}
                        title={offer.active ? "Hide from website" : "Show on website"}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          {offer.active ? (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243" />
                          )}
                        </svg>
                      </button>
                      <button
                        onClick={() => openEdit(offer)}
                        title="Edit"
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(offer)}
                        title="Delete"
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {resolved.map((r, i) => (
                      <div key={`${offer.id}-${i}`} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 pr-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-gray-700">
                          {r.product?.coverImageUrl && (
                            <Image src={r.product.coverImageUrl} alt={r.product.name} fill sizes="36px" className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-white font-saira">
                            {r.product?.name ?? "Deleted product"}
                          </p>
                          <p className="truncate text-[10px] text-gray-400 font-saira">
                            {r.slot.size ?? "Default"}
                            {r.product ? ` · ${formatLkr(unitPriceOf(r.product, r.slot.size))}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {missing && (
                    <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 font-saira">
                      A product in this combo was deleted, so it is hidden from the website. Edit it to fix.
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-gray-500 font-saira">Combo price</p>
                      <p className="text-xl font-bold text-amber-400 font-saira">{formatLkr(offer.comboPrice)}</p>
                    </div>
                    <div className="text-right text-xs font-saira">
                      <p className="text-gray-400">
                        Separately <span className="text-gray-300 line-through">{formatLkr(originalTotal)}</span>
                      </p>
                      {savings > 0 && (
                        <p className="mt-0.5 font-semibold text-emerald-400">
                          Saves {formatLkr(savings)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <ComboOfferForm
          products={products}
          editing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { if (!busy) setDeleteTarget(null); }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-7 w-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-white font-saira">Delete Combo Offer</h3>
            <p className="mt-2 text-center text-sm text-gray-400 font-saira">
              &quot;{deleteTarget.name}&quot; will be removed from the website. The products themselves are not affected.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={!!busy}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50 font-saira"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={!!busy}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-60 font-saira"
              >
                {busy ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
