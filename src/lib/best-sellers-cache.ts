import { unstable_cache } from "next/cache";
import { fetchBestSellerIds } from "@/lib/best-sellers";

/**
 * Cached best-seller ID list for server components. Shares the catalog cache
 * window so the home page issues at most one extra Firestore read per window.
 */
export const getCachedBestSellerIds = unstable_cache(
  async () => fetchBestSellerIds(),
  ["home-best-sellers"],
  { revalidate: 120, tags: ["best-sellers"] },
);
