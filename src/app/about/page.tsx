import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import FAQ from "@/components/FAQ";
import SectionHeading from "@/components/SectionHeading";
import Link from "next/link";
import aboutImage from "@/assets/about.jpg";
import fernTexture from "@/assets/aboutus.png";

export const metadata: Metadata = {
  title: "About Aroma Notes",
  description: "Aroma Notes is a luxury fragrance house in Sri Lanka importing world-class handmade perfumes crafted by Yusuf Bhai. Experience authentic craftsmanship, elegance, and exceptional longevity.",
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: "About Aroma Notes",
    description: "Discover our story and commitment to luxury artisan fragrances.",
    images: [
      { url: "/yusuf-bhai.webp", width: 1200, height: 630, alt: "Aroma Notes" },
    ],
  },
  twitter: {
    title: "About Aroma Notes",
    description: "Discover our story and commitment to luxury artisan fragrances.",
    card: "summary_large_image",
    images: ["/yusuf-bhai.webp"],
  },
};

const COMMITMENTS = [
  {
    title: "Premium Selection",
    text: "Every fragrance is carefully curated with premium oils and world-class compositions for exceptional quality and longevity.",
    icon: "M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z",
  },
  {
    title: "Precision Crafting",
    text: "Each blend is meticulously composed from first impression to final dry down, ensuring depth and sophistication in every spray.",
    icon: "M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z",
  },
  {
    title: "Luxury Experience",
    text: "Whether a bold signature or a refined everyday fragrance, we deliver pure luxury with outstanding performance and character.",
    icon: "M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z",
  },
];

const JOURNEY = [
  { title: "Handcrafted", text: "Yusuf Bhai blends every fragrance by hand using premium quality oils." },
  { title: "Imported", text: "Each bottle is brought directly from his collection to Sri Lanka." },
  { title: "Curated", text: "We choose signature originals and inspired scents worth wearing." },
  { title: "Delivered", text: "Pay cash on delivery, by bank deposit, or in installments with Payzy." },
];

const STATS = [
  { value: "100%", label: "Authentic Quality" },
  { value: "50+", label: "Unique Fragrances" },
  { value: "6-8h", label: "Long Lasting Wear" },
  { value: "Timeless", label: "Appeal" },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header currentPage="about" />

      <main className="flex-grow bg-white">
        <HeroVideo
          eyebrow="Our Story"
          title="Discover the Art of Perfume"
          subtitle="Refined, imported, and crafted for those who value excellence in luxury fragrances."
        />

        {/* Our Story */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto grid items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-[10vw]">
            <div data-reveal className="relative isolate">
              <div
                className="aspect-[4/5] w-full bg-cover bg-center sm:aspect-[5/4] lg:aspect-[4/5]"
                style={{ backgroundImage: `url(${aboutImage.src})` }}
                role="img"
                aria-label="Aroma Notes perfume collection"
              />
              <div className="absolute -bottom-6 right-0 bg-gray-950 px-6 py-5 sm:-right-6 sm:px-8 sm:py-6">
                <p className="eyebrow text-primary">Handcrafted by</p>
                <p className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Yusuf Bhai</p>
              </div>
              <div className="absolute -left-3 -top-3 -z-10 hidden h-full w-full border border-primary lg:block" aria-hidden />
            </div>

            <div data-reveal>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-primary">01</span>
                <span className="h-px w-10 bg-primary" />
                <span className="eyebrow text-gray-500">Who We Are</span>
              </div>
              <h2 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-tight text-gray-900 sm:text-5xl">
                About
                <span className="text-outline block">Aroma Notes</span>
              </h2>
              <p className="mt-6 text-base leading-relaxed text-gray-600 sm:text-lg">
                Aroma Notes is a luxury fragrance house in Sri Lanka, importing world-class handmade perfumes
                crafted by Yusuf Bhai. Each scent is created with premium oils and inspired by high-end niche
                fragrances. Our commitment to quality ensures every bottle delivers authentic craftsmanship,
                elegance, and exceptional longevity.
              </p>
              <blockquote className="mt-8 border-l-2 border-primary pl-6">
                <p className="text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">
                  &ldquo;Fragrance is more than a scent. It is an experience of pure luxury, designed to leave a lasting
                  impression.&rdquo;
                </p>
                <footer className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500">The Aroma Notes Promise</footer>
              </blockquote>
              <Link
                href="/products"
                className="group mt-10 inline-flex items-center gap-3 bg-gray-900 px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-primary"
              >
                Explore the Collection
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="square" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-gray-200 bg-white">
          <div className="mx-auto grid grid-cols-2 md:grid-cols-4 lg:mx-[10vw] lg:border-x lg:border-gray-200">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`border-gray-200 px-4 py-10 text-center sm:py-12 ${i < 3 ? "md:border-r" : ""} ${
                  i % 2 === 0 ? "border-r" : ""
                } ${i < 2 ? "border-b md:border-b-0" : ""}`}
              >
                <p className="text-3xl font-black text-primary sm:text-5xl">{s.value}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Journey */}
        <section
          className="relative bg-gray-950 bg-cover bg-center py-20 sm:py-28"
          style={{ backgroundImage: `url(${fernTexture.src})` }}
        >
          <div className="absolute inset-0 bg-black/40" aria-hidden />
          <div className="relative mx-auto px-4 sm:px-6 lg:px-[10vw]">
            <SectionHeading
              tone="dark"
              index="02"
              eyebrow="Our Process"
              title={<>From Yusuf Bhai <span className="text-primary">To You</span></>}
              description="Every bottle follows the same careful path from the perfumer's hands to yours."
            />
            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {JOURNEY.map((step, i) => (
                <div
                  key={step.title}
                  data-reveal
                  style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                  className="group relative bg-gray-950/90 p-7 transition-colors duration-300 hover:bg-black"
                >
                  <span className="text-outline text-6xl font-black leading-none text-white/30 transition-colors duration-300 group-hover:text-primary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-lg font-extrabold uppercase tracking-[0.1em] text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-400">{step.text}</p>
                  <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="bg-gray-50 py-20 sm:py-28">
          <div className="mx-auto px-4 sm:px-6 lg:px-[10vw]">
            <SectionHeading
              index="03"
              eyebrow="What We Stand For"
              title="Our Commitment"
              description="World-class fragrances with exceptional quality, longevity, and sophistication, for those who appreciate true perfume artistry."
            />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {COMMITMENTS.map((c, i) => (
                <div
                  key={c.title}
                  data-reveal
                  style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                  className="group border border-gray-200 bg-white p-8 transition-colors duration-300 hover:border-gray-900"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center bg-gray-950 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <svg fill="currentColor" height="24" width="24" viewBox="0 0 256 256" aria-hidden>
                        <path d={c.icon} />
                      </svg>
                    </div>
                    <span className="text-xs font-black text-gray-300">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-6 text-base font-extrabold uppercase tracking-[0.12em] text-gray-900">{c.title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQ />
      </main>

      <Footer />
    </div>
  );
}
