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
          <div className="fixed inset-0 z-[9999]">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 w-[85vw] max-w-[360px] h-full bg-white shadow-2xl flex flex-col overflow-y-auto animate-slide-in-right">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b">
                <h3 className="text-sm font-semibold tracking-[0.2em] text-gray-800">FILTERS</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-gray-100 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
                  aria-label="Close filters"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sections */}
              <div className="px-4 py-3 space-y-6">
                {/* Availability */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold tracking-[0.2em] text-gray-700">AVAILABILITY</h4>
                  </div>
                  <label className="flex items-center gap-3 text-sm text-gray-700 font-saira">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 accent-primary font-saira"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                    />
                    In stock only
                  </label>
                </section>

                {/* Price */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold tracking-[0.2em] text-gray-700">PRICE</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={0}
                      className="w-32 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="Min"
                      inputMode="numeric"
                      value={priceMin ?? ""}
                      onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      min={0}
                      className="w-32 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="Max"
                      inputMode="numeric"
                      value={priceMax ?? ""}
                      onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </section>

                {/* Gender */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold tracking-[0.2em] text-gray-700">GENDER</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 font-saira">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                        checked={gender.female}
                        onChange={(e) => setGender({ ...gender, female: e.target.checked })}
                      />
                      Female
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                        checked={gender.male}
                        onChange={(e) => setGender({ ...gender, male: e.target.checked })}
                      />
                      Male
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                        checked={gender.unisex}
                        onChange={(e) => setGender({ ...gender, unisex: e.target.checked })}
                      />
                      Unisex
                    </label>
                  </div>
                </section>

                {/* Brand */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xs font-semibold tracking-[0.2em] text-gray-700">BRAND INSPIRATION</h4>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700 font-saira">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                        checked={perfumeType.originals}
                        onChange={(e) => setPerfumeType({ ...perfumeType, originals: e.target.checked })}
                      />
                      YB Originals
                    </label>
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                        checked={perfumeType.inspired}
                        onChange={(e) => setPerfumeType({ ...perfumeType, inspired: e.target.checked })}
                      />
                      Inspired
                    </label>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-900 font-saira uppercase"
                >
                  VIEW RESULTS
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      ) : null}
    </div>
  );
}


