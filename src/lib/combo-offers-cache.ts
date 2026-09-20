import { unstable_cache } from "next/cache";
import { fetchComboOffers } from "@/lib/combo-offers";
import type { ComboOffer } from "@/lib/combo-offers";

const getCachedRawComboOffers = unstable_cache(
  async () => fetchComboOffers(),
  ["home-combo-offers"],
  { revalidate: 120, tags: ["combo-offers"] },
);

/**
 * unstable_cache serializes its payload, so createdAt returns as a string on
 * cache hits. Revive it the same way the product cache does.
 */
export async function getCachedComboOffers(): Promise<ComboOffer[]> {
  const offers = await getCachedRawComboOffers();
  return offers.map((o) => {
    const createdAt = o.createdAt ? new Date(o.createdAt) : undefined;
    return {
      ...o,
      createdAt: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt : undefined,
    };
  });
}
