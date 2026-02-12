"use client";

import { useEffect, useState } from "react";
import { fetchAllProducts } from "@/lib/firestore-products";
import ProductsCatalog from "@/components/ProductsCatalog";
import type { Product } from "@/types/product";

export default function ProductsLoader() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllProducts()
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500 font-saira">Loading products…</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-center text-gray-500 font-saira">No products available yet. Check back soon!</p>
      </div>
    );
  }

  return <ProductsCatalog products={products} />;
}
