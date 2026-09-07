"use client";

import BestSellersManager from "@/components/admin/BestSellersManager";

export default function BestSellersPage() {
  return (
    <div className="min-h-screen p-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.5l2.4 4.87 5.37.78-3.89 3.79.92 5.35-4.8-2.52-4.8 2.52.92-5.35-3.89-3.79 5.37-.78 2.4-4.87z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Best Sellers</h1>
            <p className="text-sm text-white/70 font-saira">
              Choose up to 10 products to feature on the home page
            </p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      <div className="mt-6">
        <BestSellersManager />
      </div>
    </div>
  );
}
