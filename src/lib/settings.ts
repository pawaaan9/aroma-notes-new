import {
  doc,
  getDoc,
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
/*  API-based fetch (works in every browser, no Firestore auth needed) */
/* ------------------------------------------------------------------ */

async function fetchSettingsViaApi(): Promise<StoreSettings> {
  const res = await fetch("/api/settings", { cache: "no-store" });
  if (!res.ok) throw new Error("API settings fetch failed");
  const data = await res.json();
  return { deliveryFee: typeof data.deliveryFee === "number" ? data.deliveryFee : 0 };
}

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

/** Fetch store settings once via API route (reliable in all browsers). */
export async function fetchSettings(): Promise<StoreSettings> {
  return fetchSettingsViaApi();
}

/** Real-time listener for store settings (used by admin panel). */
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
    () => { /* ignore errors */ },
  );
}

/**
 * Robust settings loader for customer-facing pages.
 * Uses the /api/settings endpoint (server-side, works everywhere) with
 * retry logic. Also starts a Firestore listener as a bonus for live updates.
 */
export function loadSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  let alive = true;

  const deliver = (s: StoreSettings) => {
    if (alive) callback(s);
  };

  // Primary path: fetch via API route (works in all browsers)
  (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (!alive) return;
      try {
        const settings = await fetchSettingsViaApi();
        deliver(settings);
        return;
      } catch {
        if (!alive) return;
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  })();

  // Secondary path: Firestore real-time listener (bonus, keeps value fresh)
  const unsub = onSnapshot(
    SETTINGS_DOC,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.deliveryFee === "number") {
          deliver({ deliveryFee: data.deliveryFee });
        }
      }
    },
    () => { /* ignore — API path is the primary */ },
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
