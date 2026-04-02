import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SETTINGS_DOC = doc(db, "settings", "store");

export async function GET() {
  try {
    const snap = await getDoc(SETTINGS_DOC);
    if (snap.exists()) {
      const data = snap.data();
      return NextResponse.json({
        deliveryFee: typeof data.deliveryFee === "number" ? data.deliveryFee : 0,
      });
    }
    return NextResponse.json({ deliveryFee: 0 });
  } catch (err) {
    console.error("Failed to fetch settings:", err);
    return NextResponse.json({ deliveryFee: 0 }, { status: 500 });
  }
}
