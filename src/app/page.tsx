import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";
import Link from "next/link";
import ProductGrid, { productCardProps } from "@/components/ProductGrid";
import SectionHeading from "@/components/SectionHeading";
import { getCachedProducts } from "@/lib/products-cache";
import { getCachedBestSellerIds } from "@/lib/best-sellers-cache";
import ComboOffers from "./ComboOffers";
import { getCachedComboOffers } from "@/lib/combo-offers-cache";
import { resolveCombo, type ResolvedCombo } from "@/lib/combo-offers";

export const revalidate = 120;

export default async function Home() {
  let allProducts: Awaited<ReturnType<typeof getCachedProducts>> = [];
  let bestSellerIds: string[] = [];
  let comboOffers: Awaited<ReturnType<typeof getCachedComboOffers>> = [];
  try {
    [allProducts, bestSellerIds, comboOffers] = await Promise.all([
      getCachedProducts(),
      getCachedBestSellerIds().catch(() => []),
      getCachedComboOffers().catch(() => []),
    ]);
  } catch {
    /* Firestore unavailable: sections hide gracefully */
  }

  const productsById = new Map(allProducts.map((p) => [p._id, p]));
  const combos = comboOffers
    .map((offer) => resolveCombo(offer, productsById))
    .filter((c): c is ResolvedCombo => c !== null);
  const bestSellers = bestSellerIds
    .map((id) => productsById.get(id))
    .filter((p): p is (typeof allProducts)[number] => p !== undefined);

  const recentProducts = [...allProducts].sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
  );
  const heroProduct = bestSellers[0] ?? recentProducts[0];
  const featured = heroProduct ? productCardProps(heroProduct) : null;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header currentPage="home" />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-black">
          {/* Mobile video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 block h-full w-full scale-[1.2] object-cover sm:hidden"
            style={{ objectPosition: "left center" }}
          >
            <source src="/hero-mobile.mp4" type="video/mp4" />
          </video>
          {/* Desktop/tablet video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 hidden h-full w-full object-cover sm:block"
          >
            <source src="/hero-mobile.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60" />

          {/* Frame lines */}
          <div className="pointer-events-none absolute inset-y-0 left-[5vw] hidden w-px bg-white/10 lg:block" />
          <div className="pointer-events-none absolute inset-y-0 right-[5vw] hidden w-px bg-white/10 lg:block" />

          <div className="relative z-10 flex flex-1 items-center px-4 pt-32 pb-12 sm:px-6 lg:px-[10vw]">
            <div className="grid w-full items-center gap-12 lg:grid-cols-12">
              <div className="text-white animate-fade-in-up lg:col-span-8">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-primary" />
                  <p className="eyebrow text-primary">Exclusive Imports &middot; Handcrafted by Yusuf Bhai</p>
                </div>
                <h1 className="mt-6 text-[2.75rem] font-black uppercase leading-[0.95] tracking-tight sm:text-7xl xl:text-8xl">
                  Where Every
                  <span className="text-outline block text-white">Scent Tells</span>
                  <span className="block">
                    A Story<span className="text-primary">.</span>
                  </span>
                </h1>
                <p className="mt-7 max-w-lg text-sm leading-relaxed text-gray-300 sm:text-base">
                  Discover Aroma Notes, an exclusive collection of artisanal perfumes. Each bottle a masterpiece
                  of olfactory artistry, imported to Sri Lanka.
                </p>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    className="group inline-flex items-center justify-center gap-3 bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-gray-900"
                    href="/products"
                  >
                    Explore Collection
                    <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <a
                    className="inline-flex items-center justify-center border border-white/40 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:bg-white hover:text-gray-900"
                    href="#about"
                  >
                    Our Story
                  </a>
                </div>
              </div>

              {/* Featured product */}
              {featured && (
                <Link
                  href={featured.href}
                  className="group hidden border border-white/20 bg-black/50 text-white transition-colors hover:border-primary lg:col-span-4 lg:block xl:ml-auto xl:w-[320px]"
                >
                  <div className="flex items-center justify-between border-b border-white/20 px-4 py-3">
                    <span className="eyebrow text-primary">Featured</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      {bestSellers.length > 0 ? "Best Seller" : "New In"}
                    </span>
                  </div>
                  <div className="relative aspect-square overflow-hidden bg-gray-900">
                    <Image
                      src={featured.imageSrc}
                      alt={featured.imageAlt}
                      fill
                      sizes="320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                  <div className="p-4">
                    {featured.label && <p className="eyebrow text-gray-400">{featured.label}</p>}
                    <p className="mt-1.5 truncate text-base font-extrabold">{featured.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{featured.price}</p>
                  </div>
                  <div className="bg-primary py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors group-hover:bg-white group-hover:text-gray-900">
                    Shop Now
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Info bar */}
          <div className="relative z-10 border-t border-white/15 bg-black/60">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:mx-[10vw] lg:border-x lg:border-white/15">
            {[
              { title: "100% Authentic", text: "Direct from Yusuf Bhai" },
              { title: "Handcrafted", text: "Premium oils, small batches" },
              { title: "Pay in 4", text: "Interest free with Payzy" },
              { title: "Personal Support", text: "Chat with us on WhatsApp" },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex items-start gap-3 border-white/15 px-4 py-4 sm:px-6 sm:py-5 ${i % 2 === 0 ? "border-r" : ""} ${
                  i < 2 ? "border-b md:border-b-0" : ""
                } ${i === 1 ? "md:border-r" : ""}`}
              >
                <span className="text-[10px] font-black text-primary">0{i + 1}</span>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white sm:text-xs">{item.title}</p>
                  <p className="mt-1 text-[11px] text-gray-400 sm:text-xs">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section id="best-sellers" className="scroll-mt-24 bg-[#0a0a0f] py-16 sm:py-20">
            <div className="mx-auto px-4 sm:px-6 lg:px-[10vw]">
              <SectionHeading
                tone="dark"
                index="01"
                eyebrow="Customer Favourites"
                title="Best Sellers"
                description="The scents our customers keep coming back for."
                action={{ href: "/products", label: "Shop All" }}
              />
              <ProductGrid products={bestSellers} />
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {recentProducts.length > 0 && (
          <section id="new-arrivals" className="scroll-mt-24 border-t border-white/10 bg-gray-950 py-16 sm:py-20">
            <div className="mx-auto px-4 sm:px-6 lg:px-[10vw]">
              <SectionHeading
                tone="dark"
                index="02"
                eyebrow="Just Dropped"
                title="New Arrivals"
                description="Our latest additions, freshly curated scents that redefine elegance."
                action={{ href: "/products", label: "Shop All New" }}
              />
              <ProductGrid products={recentProducts.slice(0, 5)} priorityCount={5} />
            </div>
          </section>
        )}

        {/* Combo Offers */}
        {combos.length > 0 && (
          <section className="relative overflow-hidden border-t border-white/10 bg-[#0a0a0f] py-16 sm:py-20">
            <p
              className="text-outline pointer-events-none absolute -right-4 top-10 select-none whitespace-nowrap text-[7rem] font-black uppercase leading-none text-white/[0.07] sm:text-[11rem]"
              aria-hidden
            >
              Together
            </p>
            <div className="relative mx-auto px-4 sm:px-6 lg:px-[10vw]">
              <SectionHeading
                tone="dark"
                index="03"
                eyebrow="Layering Combos"
                title={<>Better <span className="text-primary">Together</span></>}
                description="Hand picked pairings at one bundle price. Layer them like a pro and pay less."
              />
              <ComboOffers combos={combos} />
            </div>
          </section>
        )}

        {/* Cinematic Video */}
        <section className="relative h-[60vh] w-full overflow-hidden bg-black sm:h-[70vh]">
          <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
            <source src="/c8262ad0dea54c6b8003d869c20730e8.HD-1080p-7.2Mbps-45963023.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 flex h-full items-center px-4 sm:px-6 lg:px-[10vw]">
            <div data-reveal className="max-w-2xl border-l-2 border-primary pl-6 sm:pl-10">
              <p className="eyebrow text-primary">Signature Scents</p>
              <h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
                Crafted
                <span className="text-outline block">for the Bold</span>
              </h2>
              <p className="mt-5 text-base leading-relaxed text-gray-300 sm:text-lg">
                Every drop is a statement. Experience luxury that lingers.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Collection */}
        <section id="products" className="bg-white py-16 sm:py-20">
          <div className="mx-auto px-4 sm:px-6 lg:px-[10vw]">
            <SectionHeading
              index="04"
              eyebrow="Signature Collection"
              title="Masterpiece Fragrances"
              description="Each fragrance is a carefully crafted composition of notes, designed to evoke emotion and create lasting memories."
              action={{ href: "/products", label: "View All" }}
            />
            <ProductGrid products={recentProducts.slice(0, 10)} />
          </div>
        </section>

        {/* About */}
        <section id="about" className="scroll-mt-24 border-t border-gray-200 bg-white">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[360px] sm:min-h-[480px]">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/forhimafter.webp')" }}
                role="img"
                aria-label="Aroma Notes fragrance"
              />
            </div>
            <div className="flex items-center bg-gray-950 px-6 py-16 sm:px-12 lg:px-16">
              <div data-reveal className="max-w-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-primary">05</span>
                  <span className="h-px w-10 bg-primary" />
                  <span className="eyebrow text-gray-400">Our Craft</span>
                </div>
                <h2 className="mt-5 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl">
                  The Art of
                  <span className="text-outline block">Perfumery</span>
                </h2>
                <p className="mt-6 text-base leading-relaxed text-gray-400">
                  Fragrance is more than a scent. It is an expression of personality, a memory in a bottle,
                  and a journey of the senses. We blend tradition with innovation to craft unforgettable experiences.
                </p>
                <div className="mt-8 grid grid-cols-2 border-l border-t border-white/15">
                  {[
                    "Hand Selected Ingredients",
                    "Small Batch Production",
                    "Ethically Sourced",
                    "100% Authentic",
                  ].map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2.5 border-b border-r border-white/15 px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-200"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 bg-primary" />
                      {tag}
                    </div>
                  ))}
                </div>
                <Link
                  href="/about"
                  className="group mt-10 inline-flex items-center gap-3 bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-gray-900"
                >
                  Learn More
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
