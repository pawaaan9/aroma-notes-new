"use client";
import Image from "next/image";
import Link from "next/link";

const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Crect fill='%23e5e7eb' width='4' height='5'/%3E%3C/svg%3E";

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
  priority?: boolean;
  sizes?: string;
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
  label,
  priority = false,
  sizes,
}: ProductCardProps) {
  if (showQuickAdd) {
    const resolvedSizes = sizes ?? "(min-width: 1024px) 33vw, 50vw";
    const CardInner = (
      <div className={`group relative animate-fade-in-up ${delay}`}>
        <div className="relative aspect-[4/5] w-full max-h-[380px] overflow-hidden rounded-lg bg-gray-200 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/10">
          {label ? (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded bg-gray-900/90 text-white text-[7px] tracking-normal uppercase shadow whitespace-nowrap">
              {label}
            </div>
          ) : null}
          <Image
            alt={imageAlt}
            className="h-full w-full object-cover object-center transition-transform duration-300"
            src={imageSrc}
            fill
            sizes={resolvedSizes}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
          />
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

  const resolvedSizes = sizes ?? "(min-width: 1024px) 25vw, 50vw";
  const CardInner = (
    <div className={`group relative animate-fade-in-up ${delay}`}>
      <div className="relative rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1.5 hover:border-gray-200">
        {/* Image */}
        <div className="relative aspect-[4/5] w-full max-h-[360px] overflow-hidden bg-gray-50">
          {label ? (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-2.5 py-1 rounded-full bg-gray-900/80 backdrop-blur-md text-white text-[9px] font-semibold tracking-wider uppercase shadow-lg whitespace-nowrap">
              {label}
            </div>
          ) : null}
          <Image
            alt={imageAlt}
            className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            src={imageSrc}
            fill
            sizes={resolvedSizes}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
          />
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-1 sm:line-clamp-2 font-saira">
              {name}
            </h3>
            {description ? (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2 font-saira">
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {originalPrice && (
              <span className="text-xs line-through text-gray-400 font-medium font-saira whitespace-nowrap">
                {originalPrice}
              </span>
            )}
            <span className="text-sm sm:text-base font-bold text-gray-900 font-saira whitespace-nowrap">{price}</span>
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
