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
    <div className="flex min-h-screen w-full flex-col animate-fade-in-up">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" />
      </div>
      
      <main className="flex-grow relative">
        <div className="relative z-20">
          <HeroVideo title="Shop Our Collection" subtitle="Discover artisan fragrances crafted to inspire." />
        </div>
        
        <div className="relative z-20">
          <div className="mx-auto max-w-none px-4 py-12 sm:px-6 lg:px-[5vw]">
            <ProductsLoader />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
