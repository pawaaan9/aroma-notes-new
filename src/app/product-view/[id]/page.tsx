"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "../ProductDetail";
import ProductCard from "@/components/ProductCard";
import { fetchProductByIdOrSlug, fetchRelatedProducts } from "@/lib/firestore-products";
import { formatLkr } from "@/utils/currency";
import { trackViewContent } from "@/lib/meta-pixel-events";
import type { Product } from "@/types/product";

export default function ProductViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProductByIdOrSlug(id)
      .then((p) => {
        setProduct(p);
        if (p) {
          const prices = (p.variants ?? [])
            .map((v) => v.discountPrice ?? v.price ?? null)
            .filter((pr): pr is number => pr != null);
          const price = prices.length > 0 ? Math.min(...prices) : 0;
          trackViewContent({ id: p._id, name: p.name, price });
          fetchRelatedProducts(p, 6).then(setRelatedProducts);
        } else {
          setRelatedProducts([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" />
      </div>
      <main className="flex-grow bg-perfume-gradient bg-perfume-paper pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm text-gray-500 font-saira">Loading product…</p>
              </div>
            </div>
          ) : product ? (
            <>
              <ProductDetail product={product} />

              {relatedProducts.length > 0 && (
                <section className="mt-16 pt-12 border-t border-amber-200/30">
                  <h2 className="text-xl font-bold text-gray-900 font-saira mb-8">You may also like</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                    {relatedProducts.map((p, index) => {
                      const imageSrc = p.coverImageUrl ?? p.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp";
                      const path = `/product-view/${p.slug?.current ?? p._id}`;
                      const label = p.brand ? p.brand.toUpperCase() : undefined;
                      const target = p.variants?.find((v) => v.size?.toLowerCase().includes("100ml")) ?? p.variants?.[0] ?? null;
                      const originalPrice = target?.price ?? null;
                      const discountPrice = target?.discountPrice ?? null;
                      const displayPrice = discountPrice != null ? formatLkr(discountPrice) : originalPrice != null ? formatLkr(originalPrice) : "";
                      const displayOriginalPrice = discountPrice != null && originalPrice != null ? formatLkr(originalPrice) : undefined;
                      const payzyX4 = originalPrice != null ? formatLkr(originalPrice / 4) : undefined;
                      return (
                        <div key={p._id}>
                          <ProductCard
                            name={p.name}
                            price={displayPrice}
                            originalPrice={displayOriginalPrice}
                            payzyX4={payzyX4}
                            imageSrc={imageSrc}
                            imageAlt={p.name}
                            delay={`delay-${(index + 1) * 100}`}
                            href={path}
                            label={label}
                            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, 50vw"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-400 font-saira">Product not found.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
