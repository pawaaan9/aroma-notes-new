import type { Product, ProductVariant } from "@/types/product";

export type CatalogSize = "10ml" | "100ml";

export function variantForSize(
  product: Product,
  size: CatalogSize,
): ProductVariant | null {
  const needle = size === "10ml" ? "10ml" : "100ml";
  return (
    product.variants?.find((v) => v.size?.toLowerCase().replace(/\s/g, "").includes(needle)) ??
    null
  );
}

export function retailPriceForVariant(variant: ProductVariant | null): number {
  if (!variant) return 0;
  return Number(variant.discountPrice ?? variant.price ?? 0) || 0;
}

export function formatSizeLabel(size: CatalogSize): string {
  return size === "10ml" ? "10 ml" : "100 ml";
}
