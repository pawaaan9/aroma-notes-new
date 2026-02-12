import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import FAQ from "@/components/FAQ";
import aboutImage from "@/assets/about.jpg";

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

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col animate-fade-in-up">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="about" />
      </div>

      <main className="flex-grow">
        {/* Shared hero video across screens */}
        <section>
          <HeroVideo
            title="Discover the Art of Perfume"
            subtitle="Refined, imported, and crafted for those who value excellence in luxury fragrances."
          />
        </section>

        {/* Our Story Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw]">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="space-y-6 animate-fade-in-up">
                <h2 className="text-3xl font-bold font-smooch tracking-tight text-gray-900 sm:text-4xl shimmer-text">
                  About Aroma Notes
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed font-saira">
                  Aroma Notes is a luxury fragrance house in Sri Lanka,
                  importing world-class handmade perfumes crafted by Yusuf Bhai.
                  Each scent is created with premium oils and inspired by
                  high-end niche fragrances. Our commitment to quality ensures
                  every bottle delivers authentic craftsmanship, elegance, and
                  exceptional longevity.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed font-saira">
                  At Aroma Notes, we believe fragrance is more than a scent,
                  it’s an experience of pure luxury, designed to leave a
                  lasting impression.
                </p>
                <div className="flex items-center gap-4 pt-4">
                  <div className="h-1 w-16 bg-gradient-to-r from-primary to-orange-600 rounded-full"></div>
                  <span className="text-sm text-gray-400 font-medium font-saira uppercase">
                    Luxury Imported Fragrances
                  </span>
                </div>
              </div>
              <div className="animate-fade-in-up delay-300">
                <div className="h-80 w-full overflow-hidden rounded-xl shadow-2xl group">
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${aboutImage.src})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw]">
            <div className="mx-auto max-w-3xl text-center mb-16">
              <div className="animate-fade-in-up">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
                  Our Commitment
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-orange-600 mx-auto rounded-full mb-6"></div>
              </div>
              <div className="animate-fade-in-up delay-300">
                <p className="text-lg text-gray-700 leading-relaxed font-saira">
                  At Aroma Notes, we are dedicated to bringing world-class
                  fragrances with exceptional quality, longevity, and
                  sophistication to those who appreciate true perfume artistry.
                  Imported from Yusuf Bhai with passion and expertise.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="group flex flex-col items-center gap-6 rounded-xl bg-white p-8 text-center shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-110 hover:-translate-y-3 animate-fade-in-up delay-100 hover:bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 text-primary transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-orange-600/30 relative z-10 animate-spin-slow">
                  <svg
                    fill="currentColor"
                    height="28"
                    viewBox="0 0 256 256"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:animate-pulse"
                  >
                    <path d="M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49c.57,15.92,5.21,32,13.79,47.85l-19.51,19.5a8,8,0,0,0,11.32,11.32l19.5-19.51C81,210.73,97.09,215.37,113,215.94q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07ZM153.75,189.5c-22.75,13.78-49.68,14-76.71.77l88.63-88.62a8,8,0,0,0-11.32-11.32L65.73,179c-13.19-27-13-54,.77-76.71,22.09-36.47,74.6-56.44,141.31-54.06C210.2,114.89,190.22,167.41,153.75,189.5Z"></path>
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-300 animate-ping"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-all duration-300 relative z-10 group-hover:scale-105 font-saira uppercase">
                  Premium Selection
                </h3>
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10 font-saira">
                  Every fragrance is carefully curated with premium oils and
                  world-class compositions for exceptional quality and
                  longevity.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>

              <div className="group flex flex-col items-center gap-6 rounded-xl bg-white p-8 text-center shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-110 hover:-translate-y-3 animate-fade-in-up delay-200 hover:bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 text-primary transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-orange-600/30 relative z-10 animate-spin-slow">
                  <svg
                    fill="currentColor"
                    height="28"
                    viewBox="0 0 256 256"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:animate-pulse"
                  >
                    <path d="M221.69,199.77,160,96.92V40h8a8,8,0,0,0,0-16H88a8,8,0,0,0,0,16h8V96.92L34.31,199.77A16,16,0,0,0,48,224H208a16,16,0,0,0,13.72-24.23ZM110.86,103.25A7.93,7.93,0,0,0,112,99.14V40h32V99.14a7.93,7.93,0,0,0,1.14,4.11L183.36,167c-12,2.37-29.07,1.37-51.75-10.11-15.91-8.05-31.05-12.32-45.22-12.81ZM48,208l28.54-47.58c14.25-1.74,30.31,1.85,47.82,10.72,19,9.61,35,12.88,48,12.88a69.89,69.89,0,0,0,19.55-2.7L208,208Z"></path>
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-300 animate-ping"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-all duration-300 relative z-10 group-hover:scale-105 font-saira uppercase">
                  Precision Crafting
                </h3>
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10 font-saira">
                  Each blend is meticulously curated from first impression to
                  final dry-down, ensuring depth and sophistication in every
                  spray.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>

              <div className="group flex flex-col items-center gap-6 rounded-xl bg-white p-8 text-center shadow-xl transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:scale-110 hover:-translate-y-3 animate-fade-in-up delay-300 hover:bg-gray-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-orange-600/20 text-primary transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-orange-600/30 relative z-10 animate-spin-slow">
                  <svg
                    fill="currentColor"
                    height="28"
                    viewBox="0 0 256 256"
                    width="28"
                    xmlns="http://www.w3.org/2000/svg"
                    className="group-hover:animate-pulse"
                  >
                    <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.61,146.24,196.15,128,206.8Z"></path>
                  </svg>
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 group-hover:border-primary/60 transition-colors duration-300 animate-ping"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-all duration-300 relative z-10 group-hover:scale-105 font-saira uppercase">
                  Luxury Experience
                </h3>
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300 relative z-10 font-saira">
                  Whether bold signature or refined everyday fragrance, we
                  deliver pure luxury with outstanding performance and
                  character.
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-orange-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-orange-600/5 animate-pulse"></div>
          </div>

          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div className="group min-w-0 text-center animate-fade-in-up delay-100 hover:scale-110 transition-all duration-500 cursor-pointer">
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 group-hover:text-orange-400 transition-colors duration-300 animate-count-up font-saira uppercase">
                    100%
                  </div>
                  <div className="absolute inset-0 text-4xl sm:text-5xl font-bold text-primary/20 mb-2 animate-pulse font-saira uppercase">
                    100%
                  </div>
                </div>
                <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300 font-saira uppercase">
                  Authentic Quality
                </div>
                <div className="mt-2 w-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 group-hover:w-full transition-all duration-500 mx-auto"></div>
              </div>

              <div className="group min-w-0 text-center animate-fade-in-up delay-200 hover:scale-110 transition-all duration-500 cursor-pointer">
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 group-hover:text-orange-400 transition-colors duration-300 animate-count-up font-saira uppercase">
                    50+
                  </div>
                  <div className="absolute inset-0 text-4xl sm:text-5xl font-bold text-primary/20 mb-2 animate-pulse font-saira uppercase">
                    50+
                  </div>
                </div>
                <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300 font-saira uppercase">
                  Unique Fragrances
                </div>
                <div className="mt-2 w-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 group-hover:w-full transition-all duration-500 mx-auto"></div>
              </div>

              <div className="group min-w-0 text-center animate-fade-in-up delay-300 hover:scale-110 transition-all duration-500 cursor-pointer">
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 group-hover:text-orange-400 transition-colors duration-300 animate-count-up font-saira ">
                    6-8h
                  </div>
                  <div className="absolute inset-0 text-4xl sm:text-5xl font-bold text-primary/20 mb-2 animate-pulse font-saira ">
                    6-8h
                  </div>
                </div>
                <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300 font-saira uppercase">
                  Long-lasting Wear
                </div>
                <div className="mt-2 w-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 group-hover:w-full transition-all duration-500 mx-auto"></div>
              </div>

              <div className="group min-w-0 text-center animate-fade-in-up delay-500 hover:scale-110 transition-all duration-500 cursor-pointer">
                <div className="relative">
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-2 group-hover:text-orange-400 transition-colors duration-300 font-saira uppercase break-words leading-tight">
                    Timeless
                  </div>
                  <div className="absolute inset-0 text-4xl sm:text-5xl font-bold text-primary/20 mb-2 animate-pulse font-saira uppercase break-words leading-tight">
                    Timeless
                  </div>
                </div>
                <div className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300 font-saira uppercase">
                  Appeal
                </div>
                <div className="mt-2 w-0 h-0.5 bg-gradient-to-r from-primary to-orange-600 group-hover:w-full transition-all duration-500 mx-auto"></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FAQ />
      <Footer />
    </div>
  );
}
