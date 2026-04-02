import {
  doc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type StoreSettings = {
  deliveryFee: number;
};

const SETTINGS_DOC = doc(db, "settings", "store");

/* ------------------------------------------------------------------ */
/*  Client-side env var fallback                                       */
/* ------------------------------------------------------------------ */

function envFallback(): number {
  const v = typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_DELIVERY_FEE ?? "0")
    : "0";
  return Number(v) || 0;
}

/* ------------------------------------------------------------------ */
/*  Read via /api/settings (server handles Firestore + fallback)       */
/* ------------------------------------------------------------------ */

async function fetchViaApi(): Promise<StoreSettings> {
  const res = await fetch("/api/settings", { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (typeof data.deliveryFee === "number" && data.deliveryFee > 0) {
    return { deliveryFee: data.deliveryFee };
  }
  throw new Error("No delivery fee returned");
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/** Fetch settings via API, with retries, with env var fallback. */
export async function fetchSettings(): Promise<StoreSettings> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fetchViaApi();
    } catch {
      if (i < 2) await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  // Last resort: env var
  const fee = envFallback();
  if (fee > 0) return { deliveryFee: fee };
  throw new Error("Failed to load delivery fee");
}

/** Real-time listener (used by admin panel where user is authenticated). */
export function subscribeToSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  return onSnapshot(
    SETTINGS_DOC,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          deliveryFee: typeof data.deliveryFee === "number" ? data.deliveryFee : 0,
        });
      }
    },
    () => {},
  );
}

/**
 * Robust settings loader for customer-facing pages.
 * 1. Calls /api/settings (server-side, tries Admin SDK + Client SDK + env var)
 * 2. Falls back to NEXT_PUBLIC_DELIVERY_FEE env var
 * 3. Also starts Firestore listener for live updates (may or may not work)
 */
export function loadSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  let alive = true;
  let resolved = false;

  // Primary: API route
  (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (!alive) return;
      try {
        const settings = await fetchViaApi();
        if (alive) {
          resolved = true;
          callback(settings);
        }
        return;
      } catch {
        if (!alive) return;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
    // API failed — use env var
    if (alive && !resolved) {
      const fee = envFallback();
      if (fee > 0) {
        resolved = true;
        callback({ deliveryFee: fee });
      }
    }
  })();

  // Secondary: Firestore listener (bonus, works when auth/rules allow)
  const unsub = onSnapshot(
    SETTINGS_DOC,
    (snap) => {
      if (alive && snap.exists()) {
        const data = snap.data();
        if (typeof data.deliveryFee === "number" && data.deliveryFee > 0) {
          resolved = true;
          callback({ deliveryFee: data.deliveryFee });
        }
      }
    },
    () => {},
  );

  return () => {
    alive = false;
    unsub();
  };
}

/* ------------------------------------------------------------------ */
/*  Write                                                              */
/* ------------------------------------------------------------------ */

/** Save store settings (merge so we don't overwrite other fields). */
export async function saveSettings(
  settings: Partial<StoreSettings>,
): Promise<void> {
  await setDoc(SETTINGS_DOC, settings, { merge: true });
}
