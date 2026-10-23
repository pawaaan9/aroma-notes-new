"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import MobileFilters from "@/components/MobileFilters";
import type { Product } from "@/types/product";
import { productCardProps } from "@/components/ProductGrid";

type GenderKey = "female" | "male" | "unisex";

export default function ProductsCatalog({ products, searchQuery = "" }: { products: Product[]; searchQuery?: string }) {
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<Record<GenderKey, boolean>>({ female: false, male: false, unisex: false });
  const [perfumeType, setPerfumeType] = useState<{ originals: boolean; inspired: boolean }>({ originals: false, inspired: false });

  const filteredProducts = useMemo(() => {
    const selectedGenders: GenderKey[] = (Object.keys(gender) as GenderKey[]).filter((g) => gender[g]);
    const perfumeTypesSelected = [perfumeType.originals ? "originals" : undefined, perfumeType.inspired ? "inspired" : undefined].filter(
      Boolean
    ) as Array<"originals" | "inspired">;

    return products.filter((p) => {
      // Search by name/brand
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          (p.name ?? "").toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // Availability
      if (inStockOnly) {
        const anyInStock = (p.variants ?? []).some((v) => v.inStock === true);
        if (!anyInStock) return false;
      }

      // Gender
      if (selectedGenders.length > 0 && (!p.gender || !selectedGenders.includes(p.gender))) {
        return false;
      }

      // Perfume type
      if (perfumeTypesSelected.length > 0 && (!p.perfumeType || !perfumeTypesSelected.includes(p.perfumeType))) {
        return false;
      }

      // Price range uses the lowest effective price among variants
      const prices = (p.variants ?? [])
        .map((v) => v.discountPrice ?? v.price ?? null)
        .filter((pr): pr is number => pr != null);
      const effective = prices.length > 0 ? Math.min(...prices) : null;
      if (priceMin != null && effective != null && effective < priceMin) return false;
      if (priceMax != null && effective != null && effective > priceMax) return false;

      return true;
    });
  }, [products, searchQuery, inStockOnly, gender, perfumeType, priceMin, priceMax]);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Sidebar filters visible on desktop only */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-28 space-y-8 border border-gray-200 bg-white p-6">
          {/* Heading */}
          <div>
            <h3 className="border-b border-gray-200 pb-4 text-sm font-extrabold uppercase tracking-[0.2em] text-gray-900">Filters</h3>
          </div>

          {/* Availability */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-700">AVAILABILITY</h3>
            </div>
            <label className="flex items-center gap-3 text-sm text-gray-700 font-saira">
              <input
                type="checkbox"
                className="h-4 w-4 border-gray-300 accent-primary"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In stock only
            </label>
          </div>

          {/* Price */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-700">PRICE</h3>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                className="w-full min-w-0 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm outline-none focus:border-gray-900"
                placeholder="Min"
                inputMode="numeric"
                value={priceMin ?? ""}
                onChange={(e) => setPriceMin(e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Minimum price"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min={0}
                className="w-full min-w-0 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-3 py-2 text-sm outline-none focus:border-gray-900"
                placeholder="Max"
                inputMode="numeric"
                value={priceMax ?? ""}
                onChange={(e) => setPriceMax(e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Maximum price"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-700">GENDER</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700 font-saira">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 accent-primary"
                  checked={gender.female}
                  onChange={(e) => setGender({ ...gender, female: e.target.checked })}
                />
                Female
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 accent-primary"
                  checked={gender.male}
                  onChange={(e) => setGender({ ...gender, male: e.target.checked })}
                />
                Male
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 accent-primary"
                  checked={gender.unisex}
                  onChange={(e) => setGender({ ...gender, unisex: e.target.checked })}
                />
                Unisex
              </label>
            </div>
          </div>

          {/* Brand Inspiration */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-700">BRAND INSPIRATION</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700 font-saira">
              <label className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 accent-primary"
                  checked={perfumeType.originals}
                  onChange={(e) => setPerfumeType({ ...perfumeType, originals: e.target.checked })}
                />
                YB Originals
              </label>
              <label className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 accent-primary"
                  checked={perfumeType.inspired}
                  onChange={(e) => setPerfumeType({ ...perfumeType, inspired: e.target.checked })}
                />
                Inspired
              </label>
            </div>
          </div>
        </div>
      </aside>

      {/* Product grid + mobile filters trigger */}
      <section className="lg:col-span-9">
        <div className="mb-5 flex items-end justify-end lg:hidden">
          <MobileFilters
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            priceMin={priceMin}
            priceMax={priceMax}
            setPriceMin={setPriceMin}
            setPriceMax={setPriceMax}
            gender={gender}
            setGender={setGender}
            perfumeType={perfumeType}
            setPerfumeType={setPerfumeType}
          />
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"}
          </p>
        </div>
        {filteredProducts.length === 0 ? (
          <div className="border border-gray-200 px-6 py-16 text-center text-sm text-gray-500">
            No products match these filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                data-reveal
                style={{ "--reveal-delay": `${(index % 4) * 70}ms` } as React.CSSProperties}
              >
                <ProductCard
                  {...productCardProps(product)}
                  priority={index < 6}
                  sizes="(min-width: 1280px) 17vw, (min-width: 640px) 25vw, 48vw"
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


