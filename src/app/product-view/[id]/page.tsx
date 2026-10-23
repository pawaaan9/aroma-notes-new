"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductDetail from "../ProductDetail";
import ProductGrid from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import { fetchProductByIdOrSlug, fetchRelatedProducts } from "@/lib/firestore-products";
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
          fetchRelatedProducts(p, 5).then(setRelatedProducts);
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
      <main className="flex-grow bg-white pt-24 pb-20 lg:pt-28">
        <div className="mx-auto px-4 sm:px-6 lg:px-[10vw]">
          {loading ? (
            // Placeholder in the shape of the product layout, so nothing jumps when it loads
            <div className="animate-pulse" aria-busy="true" aria-label="Loading product">
              <div className="mb-6 h-3 w-48 bg-gray-100" />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-14">
                <div className="aspect-square w-full bg-gray-100 md:aspect-[4/5]" />
                <div>
                  <div className="h-3 w-32 bg-gray-100" />
                  <div className="mt-4 h-9 w-3/4 bg-gray-100" />
                  <div className="mt-6 h-8 w-40 bg-gray-100" />
                  <div className="mt-3 h-4 w-56 bg-gray-100" />
                  <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div className="h-16 bg-gray-100" />
                    <div className="h-16 bg-gray-100" />
                  </div>
                  <div className="mt-6 h-14 w-full bg-gray-200" />
                  <div className="mt-2 h-12 w-full bg-gray-100" />
                  <div className="mt-8 space-y-2.5">
                    <div className="h-3 w-full bg-gray-100" />
                    <div className="h-3 w-11/12 bg-gray-100" />
                    <div className="h-3 w-4/5 bg-gray-100" />
                  </div>
                </div>
              </div>
            </div>
          ) : product ? (
            <>
              <ProductDetail product={product} />

              {relatedProducts.length > 0 && (
                <section className="mt-20 border-t border-gray-200 pt-14">
                  <SectionHeading eyebrow="Discover More" title="You May Also Like" />
                  <ProductGrid products={relatedProducts} />
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
      {/* Room for the mobile buy bar */}
      {product && <div className="h-[72px] md:hidden" />}
    </div>
  );
}
