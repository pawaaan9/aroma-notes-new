import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { formatLkr } from "@/utils/currency";

/** Card props for a product, priced from its 100ml variant when there is one. */
export function productCardProps(product: Product) {
  const target =
    product.variants?.find((v) => v.size?.toLowerCase().includes("100ml")) ?? product.variants?.[0] ?? null;
  const originalPrice = target?.price ?? null;
  const discountPrice = target?.discountPrice ?? null;
  return {
    name: product.name,
    imageSrc: product.coverImageUrl ?? product.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp",
    imageAlt: product.name,
    href: `/product-view/${product.slug?.current ?? product._id}`,
    label: product.brand ? product.brand.toUpperCase() : undefined,
    price: discountPrice != null ? formatLkr(discountPrice) : originalPrice != null ? formatLkr(originalPrice) : "",
    originalPrice: discountPrice != null && originalPrice != null ? formatLkr(originalPrice) : undefined,
    payzyX4: originalPrice != null ? formatLkr(originalPrice / 4) : undefined,
  };
}

export default function ProductGrid({
  products,
  priorityCount = 0,
  columns = 5,
}: {
  products: Product[];
  priorityCount?: number;
  columns?: 4 | 5;
}) {
  if (products.length === 0) return null;

  const grid = columns === 4 ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-3 lg:grid-cols-5";
  const sizes =
    columns === 4 ? "(min-width: 1024px) 22vw, (min-width: 640px) 31vw, 48vw" : "(min-width: 1024px) 18vw, (min-width: 640px) 31vw, 48vw";

  return (
    <div className={`grid grid-cols-2 gap-2.5 sm:gap-4 ${grid}`}>
      {products.map((product, index) => (
        <div
          key={product._id}
          data-reveal
          style={{ "--reveal-delay": `${(index % 5) * 70}ms` } as React.CSSProperties}
        >
          <ProductCard {...productCardProps(product)} priority={index < priorityCount} sizes={sizes} />
        </div>
      ))}
    </div>
  );
}
