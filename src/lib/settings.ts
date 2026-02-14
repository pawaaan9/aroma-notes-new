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

/** Real-time listener for store settings. */
export function subscribeToSettings(
  callback: (settings: StoreSettings) => void,
): Unsubscribe {
  return onSnapshot(SETTINGS_DOC, (snap) => {
    if (!snap.exists()) {
      callback({ ...DEFAULTS });
      return;
    }
    const data = snap.data();
    callback({
      deliveryFee:
        typeof data.deliveryFee === "number" ? data.deliveryFee : DEFAULTS.deliveryFee,
    });
  });
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
