"use client";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  imageSrc: string;
  imageAlt: string;
  delay?: string;
  showQuickAdd?: boolean;
  href?: string;
  label?: string;
}

export default function ProductCard({ 
  name, 
  description, 
  price, 
  originalPrice,
  imageSrc, 
  imageAlt, 
  delay = "delay-100",
  showQuickAdd = false,
  href,
  label
}: ProductCardProps) {
  if (showQuickAdd) {
    // Products page layout with Quick Add button
    const CardInner = (
      <div className={`group relative animate-fade-in-up ${delay}`}>
        <div className="aspect-[4/5] w-full max-h-[380px] overflow-hidden rounded-lg bg-gray-200 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10 relative">
          {label ? (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded bg-gray-900/90 text-white text-[7px] tracking-normal uppercase shadow whitespace-nowrap">
              {label}
            </div>
          ) : null}
          <Image
            alt={imageAlt}
            className="h-full w-full object-cover object-center transition-transform duration-300"
            src={imageSrc}
            width={400}
            height={533}
          />
          {/* Removed floating view pill on hover over image */}
        </div>
        <div className="mt-3 flex flex-col">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-primary transition-colors duration-300 font-saira line-clamp-1 sm:line-clamp-2">
            {name}
          </h3>
          <div className="mt-1 flex items-center gap-2">
            {originalPrice && (
              <span className="text-xs sm:text-sm line-through text-gray-400 font-medium font-saira whitespace-nowrap">
                {originalPrice}
              </span>
            )}
            <p className="text-sm sm:text-base font-bold text-primary font-saira whitespace-nowrap">
              {price}
            </p>
          </div>
        </div>
      </div>
    );
    if (href) {
      return <Link href={href} className="block">{CardInner}</Link>;
    }
    return CardInner;
  }

  // Home page layout with overlay details
  const CardInner = (
    <div className={`group relative animate-fade-in-up ${delay}`}> 
      {/* Outer border frame on hover */}
      <div className="absolute -inset-1 rounded-xl border-2 border-transparent group-hover:border-yellow-400 transition-all duration-500 pointer-events-none"></div>
      <div className="relative rounded-xl border-2 border-gray-200 bg-white shadow-sm transition-all duration-500 transform group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-yellow-400/40 group-hover:border-yellow-400">
      <div className="aspect-[4/5] w-full max-h-[360px] overflow-hidden rounded-t-xl bg-gray-100">
        <div className="relative overflow-hidden h-full">
          {label ? (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded bg-gray-900/90 text-white text-[7px] tracking-normal uppercase shadow whitespace-nowrap">
              {label}
            </div>
          ) : null}
          <Image
            alt={imageAlt}
            className="h-full w-full object-cover object-center transition-all duration-500"
            src={imageSrc}
            width={300}
            height={375}
          />
          {/* Overlay disabled on all viewports since details are below image */}
          <div className="hidden"></div>
          <div className="hidden"></div>
        </div>
      </div>
      {/* Details below image (all viewports) */}
      <div className="p-4 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1 sm:line-clamp-2">
              {name}
            </h3>
            {description ? (
              <p className="mt-1 text-xs sm:text-sm text-gray-600 line-clamp-2">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-start sm:items-end">
            {originalPrice && (
              <p className="text-xs sm:text-sm line-through text-gray-400 font-medium whitespace-nowrap">
                {originalPrice}
              </p>
            )}
            <p className="text-sm sm:text-base font-bold text-primary font-saira whitespace-nowrap">{price}</p>
          </div>
        </div>
        <div className="pt-1">
          <div className="group w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-amber-400/60 bg-white text-amber-700 font-semibold py-2.5 px-4 transition-all duration-300 hover:border-rose-400 hover:text-rose-600 font-saira">
            <span>View</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
  if (href) {
    return <Link href={href} className="block">{CardInner}</Link>;
  }
  return CardInner;
}
