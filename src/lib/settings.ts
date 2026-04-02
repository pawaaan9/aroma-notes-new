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
/*  Read                                                               */
/* ------------------------------------------------------------------ */

/** Fetch store settings once (with retry). */
export async function fetchSettings(retries = 3): Promise<StoreSettings> {
  for (let i = 0; i < retries; i++) {
    try {
      const snap = await getDoc(SETTINGS_DOC);
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.deliveryFee === "number") {
          return { deliveryFee: data.deliveryFee };
        }
      }
      break;
    } catch {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw new Error("Failed to load store settings");
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
          deliveryFee:
            typeof data.deliveryFee === "number" ? data.deliveryFee : 0,
        });
      }
    },
    () => { /* ignore errors */ },
  );
}

/**
 * Robust settings loader for UI components. Calls `callback` as soon as
 * the delivery fee is known. Retries `getDoc` up to 3 times, and also
 * starts an `onSnapshot` listener in parallel. Whichever resolves first
 * wins. Subsequent onSnapshot updates keep the value fresh.
 *
 * Returns an unsubscribe function.
 */
export function loadSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  let alive = true;

  const deliver = (s: StoreSettings) => {
    if (alive) callback(s);
  };

  // Path 1: one-time fetch with retry (works when WebSockets are blocked)
  (async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const snap = await getDoc(SETTINGS_DOC);
        if (!alive) return;
        if (snap.exists()) {
          const data = snap.data();
          if (typeof data.deliveryFee === "number") {
            deliver({ deliveryFee: data.deliveryFee });
            return;
          }
        }
        break;
      } catch {
        if (!alive) return;
        await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      }
    }
  })();

  // Path 2: real-time listener (works when WebSockets are available)
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
    () => { /* ignore snapshot errors — fetch path covers it */ },
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
