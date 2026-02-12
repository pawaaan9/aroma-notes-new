"use client";

import { useEffect, useState } from "react";
import { fetchAllProducts } from "@/lib/firestore-products";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { formatLkr } from "@/utils/currency";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then((all) => setProducts(all.slice(0, 8))) // show up to 8 featured
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500 font-saira">Loading fragrances…</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product, index) => {
        const imageSrc = product.coverImageUrl ?? product.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp";
        const path = `/product-view/${product.slug?.current ?? product._id}`;
        const label = product.brand ? product.brand.toUpperCase() : undefined;
        const target = product.variants?.find((v) => v.size?.toLowerCase().includes("100ml")) ?? product.variants?.[0] ?? null;
        const originalPrice = target?.price ?? null;
        const discountPrice = target?.discountPrice ?? null;
        const displayPrice = discountPrice != null ? formatLkr(discountPrice) : originalPrice != null ? formatLkr(originalPrice) : "";
        const displayOriginalPrice = discountPrice != null && originalPrice != null ? formatLkr(originalPrice) : undefined;

        return (
          <div key={product._id}>
            <ProductCard
              name={product.name}
              price={displayPrice}
              originalPrice={displayOriginalPrice}
              imageSrc={imageSrc}
              imageAlt={product.name}
              delay={`delay-${(index + 1) * 100}`}
              href={path}
              label={label}
            />
          </div>
        );
      })}
    </div>
  );
}
