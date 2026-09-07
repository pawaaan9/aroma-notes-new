import { doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Maximum number of products that can be featured as best sellers. */
export const MAX_BEST_SELLERS = 10;

const BEST_SELLERS_DOC = doc(db, "settings", "bestSellers");

function normalizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((v): v is string => typeof v === "string" && v.length > 0);
  return Array.from(new Set(ids)).slice(0, MAX_BEST_SELLERS);
}

/** Read the ordered list of best-selling product IDs. */
export async function fetchBestSellerIds(): Promise<string[]> {
  const snap = await getDoc(BEST_SELLERS_DOC);
  if (!snap.exists()) return [];
  return normalizeIds(snap.data()?.productIds);
}

/** Real-time listener for the best sellers list (admin panel). */
export function subscribeToBestSellerIds(
  callback: (productIds: string[]) => void,
): Unsubscribe {
  return onSnapshot(
    BEST_SELLERS_DOC,
    (snap) => callback(snap.exists() ? normalizeIds(snap.data()?.productIds) : []),
    () => callback([]),
  );
}

/** Save the ordered list of best-selling product IDs (max 10). */
export async function saveBestSellerIds(productIds: string[]): Promise<void> {
  await setDoc(
    BEST_SELLERS_DOC,
    { productIds: normalizeIds(productIds), updatedAt: Date.now() },
    { merge: true },
  );
}
