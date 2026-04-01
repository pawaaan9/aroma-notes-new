"use client";
import Image from "next/image";
import Link from "next/link";
import payzyLogo from "@/assets/payzy logo.jpg";

const BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Crect fill='%23e5e7eb' width='4' height='5'/%3E%3C/svg%3E";

interface ProductCardProps {
  name: string;
  description?: string;
  price: string;
  originalPrice?: string;
  payzyX4?: string;
  imageSrc: string;
  imageAlt: string;
  delay?: string;
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
  payzyX4,
  imageSrc,
  imageAlt,
  delay = "delay-100",
  href,
  label,
  priority = false,
  sizes,
}: ProductCardProps) {
  const resolvedSizes = sizes ?? "(min-width: 1024px) 25vw, 50vw";
  const CardInner = (
    <div className={`group relative animate-fade-in-up ${delay}`}>
      <div className="relative rounded-2xl bg-white border border-gray-300 overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1.5 hover:border-gray-400">
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
            quality={68}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
          />
        </div>

        <div className="p-4 space-y-2.5">
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
          {payzyX4 && (
            <div className="flex items-center gap-1.5">
              <Image src={payzyLogo} alt="Payzy" width={24} height={24} className="rounded-md shrink-0" />
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-saira whitespace-nowrap">or</span>
              <span className="text-[10px] sm:text-[11px] font-bold text-gray-800 font-saira whitespace-nowrap">
                {payzyX4}
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-saira whitespace-nowrap">x 4</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  if (href) {
    return <Link href={href} className="block">{CardInner}</Link>;
  }
  return CardInner;
}
