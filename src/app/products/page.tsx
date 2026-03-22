import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "../../components/Header";
import HeroVideo from "../../components/HeroVideo";
import Footer from "../../components/Footer";
import ProductsLoader from "./ProductsLoader";

export const metadata: Metadata = {
  title: "Shop Perfumes",
  description: "Browse artisan fragrances crafted to inspire. Discover premium perfumes with exceptional quality and longevity.",
  alternates: { canonical: "/products" },
  openGraph: {
    url: "/products",
    title: "Shop Perfumes | Aroma Notes",
    description: "Discover premium artisan fragrances crafted to inspire.",
    images: [
      { url: "/yusuf-bhai.webp", width: 1200, height: 630, alt: "Aroma Notes Products" },
    ],
  },
  twitter: {
    title: "Shop Perfumes | Aroma Notes",
    description: "Discover premium artisan fragrances crafted to inspire.",
    card: "summary_large_image",
    images: ["/yusuf-bhai.webp"],
  },
};

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" />
      </div>
      
      <main className="flex-grow relative animate-fade-in-up">
        <div className="relative z-20">
          <HeroVideo title="Shop Our Collection" subtitle="Discover artisan fragrances crafted to inspire." />
        </div>
        
        <div className="relative z-20">
          <div className="mx-auto max-w-none px-4 py-12 sm:px-6 lg:px-[5vw]">
            <Suspense fallback={
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-sm text-gray-500 font-saira">Loading products…</p>
                </div>
              </div>
            }>
              <ProductsLoader />
            </Suspense>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
