import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Try Firebase Admin SDK first (bypasses security rules)
  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    const snap = await adminDb().collection("settings").doc("store").get();
    if (snap.exists) {
      const data = snap.data();
      const fee = typeof data?.deliveryFee === "number" ? data.deliveryFee : 0;
      if (fee > 0) return NextResponse.json({ deliveryFee: fee });
    }
  } catch (err) {
    console.warn("[/api/settings] Admin SDK failed:", (err as Error).message);
  }

  // Try Firebase Client SDK (works if rules allow server reads)
  try {
    const { doc, getDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    const snap = await getDoc(doc(db, "settings", "store"));
    if (snap.exists()) {
      const data = snap.data();
      const fee = typeof data?.deliveryFee === "number" ? data.deliveryFee : 0;
      if (fee > 0) return NextResponse.json({ deliveryFee: fee });
    }
  } catch (err) {
    console.warn("[/api/settings] Client SDK failed:", (err as Error).message);
  }

  // Fallback to environment variable
  const envFee = Number(process.env.DELIVERY_FEE || process.env.NEXT_PUBLIC_DELIVERY_FEE || 0);
  if (envFee > 0) {
    return NextResponse.json({ deliveryFee: envFee });
  }

  return NextResponse.json({ deliveryFee: 0 }, { status: 500 });
}
