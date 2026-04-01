"use client";

import { useSearchParams } from "next/navigation";
import ProductsCatalog from "@/components/ProductsCatalog";
import type { Product } from "@/types/product";

export default function ProductsSearchClient({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  return <ProductsCatalog products={products} searchQuery={searchQuery} />;
}
