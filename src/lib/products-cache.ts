import { unstable_cache } from "next/cache";
import { fetchAllProducts } from "@/lib/firestore-products";

/**
 * Cached product list for server components. Reduces Firestore reads and lets
 * HTML include image URLs immediately (faster LCP than client-side fetch).
 */
export const getCachedProducts = unstable_cache(
  async () => fetchAllProducts(),
  ["catalog-all-products"],
  { revalidate: 120, tags: ["products"] },
);
