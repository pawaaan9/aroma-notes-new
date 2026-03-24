"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type GenderKey = "female" | "male" | "unisex";

export default function MobileFilters({
  inStockOnly,
  setInStockOnly,
  priceMin,
  priceMax,
  setPriceMin,
  setPriceMax,
  gender,
  setGender,
  perfumeType,
  setPerfumeType,
}: {
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  priceMin: number | undefined;
  priceMax: number | undefined;
  setPriceMin: (v: number | undefined) => void;
  setPriceMax: (v: number | undefined) => void;
  gender: Record<GenderKey, boolean>;
  setGender: (v: Record<GenderKey, boolean>) => void;
  perfumeType: { originals: boolean; inspired: boolean };
  setPerfumeType: (v: { originals: boolean; inspired: boolean }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="lg:hidden">
      {/* Trigger */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M6 12h12M10 18h4" />
          </svg>
          Filter
        </button>
      </div>

      {/* Overlay */}
      {open && mounted ? (
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/25 backdrop-blur-md transition-opacity"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <div
              className="fixed top-0 right-0 bottom-0 z-[201] w-[min(85vw,380px)] bg-white shadow-2xl flex flex-col rounded-tl-2xl rounded-bl-2xl overflow-hidden animate-slide-in-right"
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white shrink-0">
                <h2 className="text-lg font-bold font-saira uppercase text-gray-900">Filters</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 -m-2 text-gray-500 hover:text-gray-800 rounded-lg transition-colors"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 py-3 space-y-4">
                {/* Availability */}
                <section>
                  <h4 className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-gray-500 uppercase font-saira">Availability</h4>
                  <label className="flex items-center gap-3 text-sm text-gray-700 font-saira">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    In stock only
                  </label>
                </section>

                {/* Price */}
                <section>
                  <h4 className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-gray-500 uppercase font-saira">Price</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      className="w-[92px] rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 px-2.5 py-1.5 text-xs font-saira focus:border-gray-400 focus:ring-1 focus:ring-gray-300 outline-none"
                      placeholder="Min"
                      inputMode="numeric"
                      value={priceMin ?? ""}
                      onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <span className="text-xs text-gray-400 font-saira">to</span>
                    <input
                      type="number"
                      min={0}
                      className="w-[92px] rounded-lg border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 px-2.5 py-1.5 text-xs font-saira focus:border-gray-400 focus:ring-1 focus:ring-gray-300 outline-none"
                      placeholder="Max"
                      inputMode="numeric"
                      value={priceMax ?? ""}
                      onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </section>

                {/* Gender */}
                <section>
                  <h4 className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-gray-500 uppercase font-saira">Gender</h4>
                  <div className="space-y-1.5">
                    {(["female", "male", "unisex"] as GenderKey[]).map((g) => (
                      <label key={g} className="flex items-center gap-3 text-sm text-gray-700 font-saira capitalize">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                          checked={gender[g]}
                          onChange={(e) => setGender({ ...gender, [g]: e.target.checked })}
                        />
                        {g}
                      </label>
                    ))}
                  </div>
                </section>

                {/* Brand Inspiration */}
                <section>
                  <h4 className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-gray-500 uppercase font-saira">Brand Inspiration</h4>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-3 text-sm text-gray-700 font-saira">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                        checked={perfumeType.originals}
                        onChange={(e) => setPerfumeType({ ...perfumeType, originals: e.target.checked })}
                      />
                      YB Originals
                    </label>
                    <label className="flex items-center gap-3 text-sm text-gray-700 font-saira">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                        checked={perfumeType.inspired}
                        onChange={(e) => setPerfumeType({ ...perfumeType, inspired: e.target.checked })}
                      />
                      Inspired
                    </label>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 bg-white p-4 shrink-0">
                <button
                  onClick={() => setOpen(false)}
                  className="block w-full py-3 px-4 rounded-lg bg-gray-900 text-white font-saira font-semibold text-center hover:bg-gray-800 transition-colors uppercase"
                >
                  View Results
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      ) : null}
    </div>
  );
}


