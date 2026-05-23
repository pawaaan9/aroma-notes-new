import { adminDb } from "@/lib/firebase-admin";

/** Delivery fee from Firestore settings, with env var fallback. */
export async function getStoreDeliveryFee(): Promise<number> {
  try {
    const snap = await adminDb().collection("settings").doc("store").get();
    if (snap.exists) {
      const fee = snap.data()?.deliveryFee;
      if (typeof fee === "number") return Math.max(0, fee);
    }
  } catch (err) {
    console.warn("[settings-admin] Failed to read delivery fee:", err);
  }
  const envFee = Number(process.env.DELIVERY_FEE || process.env.NEXT_PUBLIC_DELIVERY_FEE || 0);
  return Math.max(0, envFee);
}
