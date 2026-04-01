import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";
import { formatLkr } from "@/utils/currency";

export default function NewArrivals({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
      {products.map((product, index) => {
        const imageSrc = product.coverImageUrl ?? product.variants?.[0]?.photoUrl ?? "/yusuf-bhai.webp";
        const path = `/product-view/${product.slug?.current ?? product._id}`;
        const label = product.brand ? product.brand.toUpperCase() : undefined;
        const target = product.variants?.find((v) => v.size?.toLowerCase().includes("100ml")) ?? product.variants?.[0] ?? null;
        const originalPrice = target?.price ?? null;
        const discountPrice = target?.discountPrice ?? null;
        const displayPrice = discountPrice != null ? formatLkr(discountPrice) : originalPrice != null ? formatLkr(originalPrice) : "";
        const displayOriginalPrice = discountPrice != null && originalPrice != null ? formatLkr(originalPrice) : undefined;
        const payzyX4 = originalPrice != null ? formatLkr(originalPrice / 4) : undefined;

        return (
          <div key={product._id}>
            <ProductCard
              name={product.name}
              price={displayPrice}
              originalPrice={displayOriginalPrice}
              payzyX4={payzyX4}
              imageSrc={imageSrc}
              imageAlt={product.name}
              delay={`delay-${(index + 1) * 100}`}
              href={path}
              label={label}
              priority={index < 4}
              sizes="(min-width: 1024px) 22vw, 48vw"
            />
          </div>
        );
      })}
    </div>
  );
}
