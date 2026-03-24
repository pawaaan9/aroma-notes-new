import Header from "../components/Header";
import Footer from "../components/Footer";
import FeaturedProducts from "./FeaturedProducts";
import NewArrivals from "./NewArrivals";

export default async function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="home" />
      </div>
      
      <main className="flex-grow animate-fade-in-up">
        {/* Hero Section with Video Background */}
        <section className="relative w-full h-screen overflow-hidden">
          {/* Video Background */}
          {/* Mobile video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-left z-0 block sm:hidden transform scale-[1.2]"
            style={{ objectFit: 'cover', objectPosition: 'left center' }}
          >
            <source src="/hero-mobile.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Desktop/tablet video */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 hidden sm:block"
            style={{ objectFit: 'cover', objectPosition: 'center center' }}
          >
            <source src="/hero-mobile.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Overlay Gradients (subtle dark for readability, no fog) */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/40 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-20"></div>
          
          {/* Main Content */}
          <div className="absolute inset-0 z-30 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl w-full text-center text-white">
              <div className="animate-fade-in-up">
                <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-full border border-amber-400/30 backdrop-blur-sm">
                  <span className="text-amber-300 text-sm font-medium tracking-wider uppercase font-saira">Exclusive Imports</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-audiowide tracking-wider bg-gradient-to-r from-white via-amber-100 to-rose-100 bg-clip-text text-transparent animate-gradient-x shimmer-text">
                  Aroma Notes
                </h1>
              </div>
              <div className="animate-fade-in-up delay-300">
                <p className="mt-6 sm:mt-8 max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-gray-100 leading-relaxed font-saira px-4">
                  Where every scent tells a story. Discover our exclusive collection of artisanal perfumes, 
                  each bottle a masterpiece of olfactory artistry.
                </p>
              </div>
              <div className="mt-8 sm:mt-12 animate-fade-in-up delay-500">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a className="w-full sm:w-auto group inline-block rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-bold font-saira text-white shadow-2xl transition-all duration-300 hover:shadow-amber-500/25 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 relative overflow-hidden" href="/products">
                    <span className="relative z-10 font-saira uppercase">Explore Collection</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </a>
                  <a className="w-full sm:w-auto group inline-block rounded-full border-2 border-amber-400/50 px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold font-saira text-amber-300 hover:bg-amber-400/10 hover:border-amber-400 transition-all duration-300 backdrop-blur-sm" href="#about">
                    <span className="relative z-8 font-saira uppercase">Our Story</span>
                  </a>
                </div>
              </div>
              
              {/* Perfume Bottle Icon */}
              <div className="mt-12 sm:mt-16 animate-bounce-subtle">
                <div className="inline-block p-3 sm:p-4 bg-gradient-to-b from-amber-500/20 to-rose-500/20 rounded-full border border-amber-400/30 backdrop-blur-sm">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* New Arrivals Section */}
        <section className="py-20 sm:py-28 bg-gray-950 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl" />
          </div>
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block mb-6 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm">
                <span className="text-amber-400 text-sm font-medium tracking-wider uppercase font-saira">Just Dropped</span>
              </div>
              <h2 className="text-4xl font-bold font-smooch tracking-tight text-white sm:text-5xl lg:text-6xl mb-6 animate-fade-in-up">
                New Arrivals
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-400 leading-relaxed font-saira animate-fade-in-up delay-300">
                Be the first to experience our latest additions — freshly curated scents that redefine elegance.
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto rounded-full mt-8 animate-fade-in-up delay-500" />
            </div>

            <NewArrivals />

            <div className="text-center mt-16 animate-fade-in-up delay-700">
              <a
                className="group inline-block rounded-full bg-white/5 border border-white/10 px-8 py-4 text-lg font-semibold text-amber-400 hover:bg-white/10 hover:border-amber-400/30 transition-all duration-300 backdrop-blur-sm font-saira"
                href="/products"
              >
                <span className="uppercase">Shop All New</span>
              </a>
            </div>
          </div>
        </section>

        {/* Cinematic Video Section */}
        <section className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/c8262ad0dea54c6b8003d869c20730e8.HD-1080p-7.2Mbps-45963023.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black/40 to-white z-10" />
          <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-smooch text-white drop-shadow-lg mb-4">
                Crafted for the Bold
              </h2>
              <p className="text-base sm:text-lg text-gray-200 font-saira leading-relaxed drop-shadow-md">
                Every drop is a statement. Experience luxury that lingers.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Collection Section — Light Creative */}
        <section id="products" className="relative py-20 sm:py-32 bg-gradient-to-b from-white via-gray-50/80 to-white overflow-hidden">
          {/* Soft ambient orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[120px]" />
            <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-rose-100/30 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw]">
            {/* Section header */}
            <div className="text-center mb-16 sm:mb-20">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-amber-200/60 bg-amber-50/60 backdrop-blur-sm animate-fade-in-up">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-amber-700 text-[11px] font-semibold tracking-[0.25em] uppercase font-saira">Signature Collection</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-smooch text-gray-900 leading-[1.1] mb-6 animate-fade-in-up delay-200">
                Masterpiece{" "}
                <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-rose-500 bg-clip-text text-transparent">Fragrances</span>
              </h2>
              <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-500 leading-relaxed font-saira animate-fade-in-up delay-300">
                Each fragrance is a carefully crafted symphony of notes, designed to evoke emotions and create lasting memories.
              </p>
              <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-rose-400 mx-auto rounded-full mt-8 animate-fade-in-up delay-500" />
            </div>
            
            {/* Featured Products from DB */}
            <FeaturedProducts />
            
            {/* Call to Action */}
            <div className="text-center mt-16 sm:mt-20 animate-fade-in-up delay-700">
              <a
                className="group inline-flex items-center gap-3 rounded-full bg-gray-900 px-8 py-4 text-sm font-bold font-saira text-white uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5"
                href="/products"
              >
                View All Fragrances
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        {/* About Section — Single Immersive Image */}
        <section id="about" className="relative min-h-[85vh] sm:min-h-[90vh] overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/forhimafter.webp')" }}
          />
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/20 to-transparent h-32 sm:h-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20 sm:from-black/80 sm:via-black/40 sm:to-transparent" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent" />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-none px-5 sm:px-6 lg:px-[5vw] flex items-center min-h-[85vh] sm:min-h-[90vh]">
            <div className="max-w-md sm:max-w-lg py-20">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-300 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase font-saira">Our Craft</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-smooch text-white leading-[1.1] mb-5">
                The Art of{" "}
                <span className="bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">Perfumery</span>
              </h2>

              {/* Body */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-saira mb-8">
                Fragrance is more than just a scent — it&apos;s an expression of personality, a memory in a bottle,
                and a journey of the senses. We blend tradition with innovation to craft unforgettable experiences.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 sm:gap-3 mb-10">
                {[
                  "Hand-Selected Ingredients",
                  "Small-Batch Production",
                  "Ethically Sourced",
                  "100% Authentic",
                ].map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] sm:text-xs font-medium text-gray-300 font-saira">
                    <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-400" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <a
                href="/products"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm font-bold font-saira text-gray-900 uppercase tracking-wider transition-all duration-300 hover:bg-amber-50 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-0.5"
              >
                Explore Collection
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
