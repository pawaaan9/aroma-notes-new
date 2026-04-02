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

const DEFAULTS: StoreSettings = {
  deliveryFee: 350,
};

const SETTINGS_DOC = doc(db, "settings", "store");

/* ------------------------------------------------------------------ */
/*  Read                                                               */
/* ------------------------------------------------------------------ */

/** Fetch store settings once. Returns defaults if doc doesn't exist. */
export async function fetchSettings(): Promise<StoreSettings> {
  const snap = await getDoc(SETTINGS_DOC);
  if (!snap.exists()) return { ...DEFAULTS };
  const data = snap.data();
  return {
    deliveryFee:
      typeof data.deliveryFee === "number" ? data.deliveryFee : DEFAULTS.deliveryFee,
  };
}

/** Real-time listener for store settings. Falls back to defaults on error. */
export function subscribeToSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  return onSnapshot(
    SETTINGS_DOC,
    (snap) => {
      if (!snap.exists()) {
        callback({ ...DEFAULTS });
        return;
      }
      const data = snap.data();
      callback({
        deliveryFee:
          typeof data.deliveryFee === "number" ? data.deliveryFee : DEFAULTS.deliveryFee,
      });
    },
    () => {
      callback({ ...DEFAULTS });
    },
  );
}

/**
 * Robust settings loader: fires callback ASAP via getDoc, then keeps it
 * updated via onSnapshot. If both fail, falls back to DEFAULTS after timeout.
 * Returns an unsubscribe function.
 */
export function loadSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  let resolved = false;
  const resolve = (s: StoreSettings) => {
    resolved = true;
    callback(s);
  };

  // 1. One-time fetch (works in all browsers, even when websockets fail)
  fetchSettings()
    .then((s) => resolve(s))
    .catch(() => {
      if (!resolved) resolve({ ...DEFAULTS });
    });

  // 2. Real-time updates for when admin changes the fee
  const unsub = subscribeToSettings((s) => resolve(s));

  // 3. Safety net: if nothing fires within 4s, use defaults
  const timer = setTimeout(() => {
    if (!resolved) resolve({ ...DEFAULTS });
  }, 4000);

  return () => {
    clearTimeout(timer);
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
