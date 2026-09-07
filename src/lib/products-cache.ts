import { unstable_cache } from "next/cache";
import { fetchAllProducts } from "@/lib/firestore-products";
import type { Product } from "@/types/product";

/**
 * Cached product list for server components. Reduces Firestore reads and lets
 * HTML include image URLs immediately (faster LCP than client-side fetch).
 */
const getCachedRawProducts = unstable_cache(
  async () => fetchAllProducts(),
  ["catalog-all-products"],
  { revalidate: 120, tags: ["products"] },
);

/**
 * unstable_cache serializes its payload, so `createdAt` comes back as an ISO
 * string on cache hits. Revive it so callers always get a real Date.
 */
export async function getCachedProducts(): Promise<Product[]> {
  const products = await getCachedRawProducts();
  return products.map((p) => {
    const createdAt = p.createdAt ? new Date(p.createdAt) : undefined;
    return {
      ...p,
      createdAt: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : undefined,
    };
  });
}
