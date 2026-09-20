import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product } from "@/types/product";

export const COMBO_MIN_ITEMS = 2;
export const COMBO_MAX_ITEMS = 10;

/** One slot in a combo: a product plus the exact bottle size being offered. */
export type ComboOfferItem = {
  productId: string;
  size: string | null;
};

export type ComboOffer = {
  id: string;
  name: string;
  description?: string | null;
  items: ComboOfferItem[];
  comboPrice: number;
  /** Waive the delivery charge when this combo is in the cart. */
  freeDelivery: boolean;
  active: boolean;
  createdAt?: Date;
};

/** A combo with its products resolved from the catalog, ready to render. */
export type ResolvedComboItem = {
  product: Product;
  size: string | null;
  unitPrice: number;
  imageUrl: string;
  inStock: boolean;
};

export type ResolvedCombo = {
  id: string;
  name: string;
  description?: string | null;
  comboPrice: number;
  freeDelivery: boolean;
  items: ResolvedComboItem[];
  originalTotal: number;
  savings: number;
  savingsPercent: number;
  inStock: boolean;
};

/**
 * Combos live in one settings document rather than their own collection: the
 * storefront reads Firestore unauthenticated, and the settings document is
 * already world readable, so no security rule change is needed.
 */
const COMBOS_DOC = doc(db, "settings", "comboOffers");

function toDate(v: unknown): Date | undefined {
  if (typeof v === "number") return new Date(v);
  if (v instanceof Date) return v;
  return undefined;
}

function normalize(data: Record<string, unknown>): ComboOffer {
  const rawItems = Array.isArray(data.items) ? data.items : [];
  return {
    id: String(data.id ?? ""),
    name: typeof data.name === "string" ? data.name : "",
    description: typeof data.description === "string" ? data.description : null,
    items: rawItems
      .filter((it): it is Record<string, unknown> => !!it && typeof it === "object")
      .map((it) => ({
        productId: String(it.productId ?? ""),
        size: typeof it.size === "string" && it.size ? it.size : null,
      }))
      .filter((it) => it.productId)
      .slice(0, COMBO_MAX_ITEMS),
    comboPrice: typeof data.comboPrice === "number" ? data.comboPrice : 0,
    freeDelivery: data.freeDelivery === true,
    active: data.active !== false,
    createdAt: toDate(data.createdAt),
  };
}

function readOffers(data: Record<string, unknown> | undefined): ComboOffer[] {
  const list = Array.isArray(data?.offers) ? data.offers : [];
  return list
    .filter((o): o is Record<string, unknown> => !!o && typeof o === "object")
    .map(normalize)
    .filter((o) => o.id)
    .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
}

/** Shape written back to Firestore. Dates become numbers inside arrays. */
function toStored(offer: ComboOffer) {
  return {
    id: offer.id,
    name: offer.name,
    description: offer.description ?? null,
    items: offer.items,
    comboPrice: offer.comboPrice,
    freeDelivery: offer.freeDelivery,
    active: offer.active,
    createdAt: offer.createdAt?.getTime() ?? Date.now(),
  };
}

async function writeAll(offers: ComboOffer[]): Promise<void> {
  await setDoc(COMBOS_DOC, { offers: offers.map(toStored) }, { merge: true });
}

/* ------------------------------------------------------------------ */
/*  Reads                                                              */
/* ------------------------------------------------------------------ */

export async function fetchComboOffers(): Promise<ComboOffer[]> {
  const snap = await getDoc(COMBOS_DOC);
  if (!snap.exists()) return [];
  return readOffers(snap.data());
}

/** Real-time listener for the admin panel. */
export function subscribeToComboOffers(
  callback: (offers: ComboOffer[]) => void,
): Unsubscribe {
  return onSnapshot(
    COMBOS_DOC,
    (snap) => callback(snap.exists() ? readOffers(snap.data()) : []),
    () => callback([]),
  );
}

/* ------------------------------------------------------------------ */
/*  Writes                                                             */
/* ------------------------------------------------------------------ */

export type ComboOfferInput = {
  name: string;
  description?: string | null;
  items: ComboOfferItem[];
  comboPrice: number;
  freeDelivery: boolean;
  active: boolean;
};

export async function createComboOffer(input: ComboOfferInput): Promise<string> {
  const existing = await fetchComboOffers();
  const id = `combo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  await writeAll([
    { ...input, description: input.description ?? null, id, createdAt: new Date() },
    ...existing,
  ]);
  return id;
}

export async function updateComboOffer(id: string, input: ComboOfferInput): Promise<void> {
  const existing = await fetchComboOffers();
  await writeAll(
    existing.map((o) =>
      o.id === id ? { ...o, ...input, description: input.description ?? null, id } : o,
    ),
  );
}

export async function deleteComboOffer(id: string): Promise<void> {
  const existing = await fetchComboOffers();
  await writeAll(existing.filter((o) => o.id !== id));
}

/* ------------------------------------------------------------------ */
/*  Resolution against the catalog                                     */
/* ------------------------------------------------------------------ */

function variantOf(product: Product, size: string | null) {
  if (!size) return product.variants?.[0] ?? null;
  return (
    product.variants?.find((v) => (v.size ?? "").toLowerCase() === size.toLowerCase()) ?? null
  );
}

/** Price a single variant is sold at on its own, discount included. */
export function unitPriceOf(product: Product, size: string | null): number {
  const v = variantOf(product, size);
  return v?.discountPrice ?? v?.price ?? 0;
}

/**
 * Join a stored combo with live catalog data. Returns null when a product has
 * been deleted or the chosen size no longer exists, so stale combos disappear
 * instead of rendering broken.
 */
export function resolveCombo(
  offer: ComboOffer,
  productsById: Map<string, Product>,
): ResolvedCombo | null {
  if (!offer.active || offer.items.length < COMBO_MIN_ITEMS) return null;

  const items: ResolvedComboItem[] = [];
  for (const item of offer.items) {
    const product = productsById.get(item.productId);
    if (!product) return null;
    const variant = variantOf(product, item.size);
    if (!variant) return null;
    items.push({
      product,
      size: item.size,
      unitPrice: variant.discountPrice ?? variant.price ?? 0,
      imageUrl: variant.photoUrl ?? product.coverImageUrl ?? "/yusuf-bhai.webp",
      inStock: variant.inStock !== false,
    });
  }

  const originalTotal = items.reduce((sum, it) => sum + it.unitPrice, 0);
  const savings = Math.max(0, originalTotal - offer.comboPrice);

  return {
    id: offer.id,
    name: offer.name,
    description: offer.description,
    comboPrice: offer.comboPrice,
    freeDelivery: offer.freeDelivery,
    items,
    originalTotal,
    savings,
    savingsPercent: originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0,
    inStock: items.every((it) => it.inStock),
  };
}

/**
 * Split the combo price across its products in proportion to what each would
 * cost alone, so every downstream total (cart, order, invoice, gateway) adds
 * up to exactly the combo price. Any rounding remainder lands on the last item.
 */
export function splitComboPrice(unitPrices: number[], comboPrice: number): number[] {
  const total = unitPrices.reduce((a, b) => a + b, 0);
  if (total <= 0 || unitPrices.length === 0) {
    const even = Math.round(comboPrice / Math.max(1, unitPrices.length));
    return unitPrices.map(() => even);
  }
  const shares = unitPrices.map((p) => Math.round((comboPrice * p) / total));
  const drift = comboPrice - shares.reduce((a, b) => a + b, 0);
  shares[shares.length - 1] += drift;
  return shares;
}

/* ------------------------------------------------------------------ */
/*  One time migration                                                 */
/* ------------------------------------------------------------------ */

/**
 * Combos first shipped in a "comboOffers" collection, which the storefront
 * cannot read unauthenticated. Anything still there is copied into the
 * settings document the first time an admin opens the page, then removed.
 * Safe to call repeatedly: it does nothing once the collection is empty.
 */
export async function migrateLegacyCombos(): Promise<number> {
  let legacyDocs;
  try {
    legacyDocs = await getDocs(collection(db, "comboOffers"));
  } catch {
    return 0; // collection unreadable or gone
  }
  if (legacyDocs.empty) return 0;

  const current = await fetchComboOffers();
  const known = new Set(current.map((o) => o.id));

  const migrated: ComboOffer[] = [];
  for (const d of legacyDocs.docs) {
    if (known.has(d.id)) continue;
    const data = d.data();
    migrated.push(normalize({ ...data, id: d.id, createdAt: Date.now() }));
  }

  if (migrated.length > 0) {
    await writeAll([...migrated, ...current]);
  }

  // Clear the old collection so this runs only once.
  for (const d of legacyDocs.docs) {
    try {
      await deleteDoc(doc(db, "comboOffers", d.id));
    } catch {
      /* leave it; the id guard above prevents duplicates */
    }
  }

  return migrated.length;
}
