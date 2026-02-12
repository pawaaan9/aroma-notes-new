import ProductCard from "@/components/ProductCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchProducts, selectDisplayPrice, selectPrimaryImage, select100mlPrice } from "@/lib/sanity";
import { formatLkr } from "@/utils/currency";

export default async function Home() {
  const products = await fetchProducts();
  const featured = products.slice(0, 8);
  return (
    <div className="flex min-h-screen w-full flex-col animate-fade-in-up">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="home" />
      </div>
      
      <main className="flex-grow">
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
          
          {/* Removed decorative particles on hero for a cleaner, clearer look */}
          
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
        
        {/* Featured Collection Section */}
        <section id="products" className="py-20 sm:py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
          {/* Removed background clouds for a crisp light section */}
          
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] relative z-20">
            <div className="text-center mb-20">
              <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full border border-amber-400/30 backdrop-blur-sm">
                <span className="text-amber-700 text-sm font-medium tracking-wider uppercase font-saira">Signature Collection</span>
              </div>
              <h2 className="text-4xl font-bold font-smooch tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6 animate-fade-in-up">
                Masterpiece Fragrances
              </h2>
              <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed font-saira animate-fade-in-up delay-300">
                Each fragrance is a carefully crafted symphony of notes, designed to evoke emotions and create lasting memories.
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-amber-500 to-rose-500 mx-auto rounded-full mt-8 animate-fade-in-up delay-500"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-8">
              {featured.map((p, idx) => {
                const imageSrc = selectPrimaryImage(p) ?? "/yusuf-bhai.webp";
                const path = `/product-view/${p.slug?.current ?? p._id}`;
                const label = p.brand ? p.brand.toUpperCase() : undefined;
                const { originalPrice, discountPrice } = select100mlPrice(p);
                const displayPrice = discountPrice != null ? formatLkr(discountPrice) : (originalPrice != null ? formatLkr(originalPrice) : "");
                const displayOriginalPrice = discountPrice != null && originalPrice != null ? formatLkr(originalPrice) : undefined;
                return (
                  <div key={p._id}>
                    <ProductCard
                      name={p.name}
                      price={displayPrice}
                      originalPrice={displayOriginalPrice}
                      imageSrc={imageSrc}
                      imageAlt={p.name}
                      delay={`delay-${(idx + 1) * 100}`}
                      showQuickAdd={true}
                      href={path}
                      label={label}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-16 animate-fade-in-up delay-700">
              <a className="group inline-block rounded-full bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-400/30 px-8 py-4 text-lg font-semibold text-amber-700 hover:bg-gradient-to-r hover:from-amber-500/20 hover:to-rose-500/20 transition-all duration-300 backdrop-blur-sm font-saira" href="/products">
                <span className="relative z-10 font-saira uppercase">View All Fragrances</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>
          </div>
        </section>
        
        {/* About Section */}
        <section id="about" className="py-20 sm:py-32 bg-white relative overflow-hidden">
          {/* Perfume Essence Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Oud Essence Cloud */}
            <div className="absolute top-10 right-10 w-48 h-48 bg-amber-800/3 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute top-15 right-15 w-32 h-32 bg-amber-700/2 rounded-full blur-2xl animate-float-slow delay-800"></div>
            
            {/* Musk Essence Cloud */}
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-gray-200/3 rounded-full blur-3xl animate-float-reverse"></div>
            <div className="absolute bottom-15 left-15 w-28 h-28 bg-gray-100/2 rounded-full blur-2xl animate-float-reverse delay-500"></div>
            
            {/* Jasmine Essence Cloud */}
            <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-white/2 rounded-full blur-3xl animate-float-slow delay-1200"></div>
            
            {/* Rose Essence Cloud */}
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-rose-200/3 rounded-full blur-3xl animate-float-reverse delay-1000"></div>
          </div>
          
          <div className="mx-auto max-w-none px-4 sm:px-6 lg:px-[5vw] relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in-up">
                <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full border border-amber-400/30 backdrop-blur-sm">
                  <span className="text-amber-700 text-sm font-medium tracking-wider uppercase font-saira">Our Craft</span>
                </div>
                <h2 className="text-4xl font-bold font-smooch tracking-tight text-gray-900 sm:text-5xl mb-6">
                  The Art of Perfumery
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed font-saira mb-8">
                  At Aroma Notes, we believe that fragrance is more than just a scent—it&apos;s an expression of personality, 
                  a memory in a bottle, and a journey of the senses. Our master perfumers combine traditional techniques 
                  with innovative approaches to create unique olfactory experiences.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-gray-700 font-saira">Hand-selected ingredients from around the world</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-gray-700 font-saira">Small-batch production for exceptional quality</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span className="text-gray-700 font-saira">Sustainable and ethical sourcing practices</span>
                  </div>
                </div>
              </div>
              <div className="animate-fade-in-up delay-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-rose-500/20 rounded-2xl blur-3xl"></div>
                    <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-amber-400/20 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="inline-block p-6 bg-gradient-to-b from-amber-500/10 to-rose-500/10 rounded-full border border-amber-400/30 mb-6">
                        <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Craftsmanship</h3>
                      <p className="text-gray-700 font-saira">
                        Every bottle is a testament to our commitment to excellence and attention to detail.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
