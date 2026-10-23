"use client";
import Image from "next/image";
import Link from "next/link";
import payzyLogo from "@/assets/payzy-wide.png";

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
  href,
  label,
  priority = false,
  sizes,
}: ProductCardProps) {
  const resolvedSizes = sizes ?? "(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw";
  const CardInner = (
    <div className="group relative flex h-full flex-col border border-gray-200 bg-white transition-colors duration-300 hover:border-gray-900">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {originalPrice ? (
          <span className="absolute left-0 top-0 z-10 bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
            Sale
          </span>
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
        {/* Hover call to action */}
        <span className="absolute inset-x-0 bottom-0 z-10 translate-y-full bg-gray-900 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-300 group-hover:translate-y-0">
          View Product
        </span>
      </div>

      <div className="flex flex-1 flex-col border-t border-gray-200 px-2.5 py-2.5 sm:px-3 sm:py-3">
        {label ? (
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.18em] text-primary">{label}</p>
        ) : null}
        <h3 className="mt-0.5 line-clamp-1 text-xs font-bold text-gray-900 sm:text-[13px]">{name}</h3>
        {description ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">{description}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-1.5 pt-1.5">
          <span className="whitespace-nowrap text-xs font-extrabold text-gray-900 sm:text-[13px]">{price}</span>
          {originalPrice && (
            <span className="whitespace-nowrap text-[10px] text-gray-400 line-through">{originalPrice}</span>
          )}
        </div>
        {payzyX4 && (
          <div className="mt-1.5 flex items-center justify-between gap-1.5 border-t border-gray-100 pt-1.5">
            <span className="truncate text-[10px] text-gray-500">
              4 &times; <span className="font-bold text-gray-800">{payzyX4}</span>
            </span>
            <Image src={payzyLogo} alt="Payzy" className="h-2.5 w-auto shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
  if (href) {
    return <Link href={href} className="block h-full">{CardInner}</Link>;
  }
  return CardInner;
}
