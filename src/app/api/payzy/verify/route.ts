import { NextRequest, NextResponse } from "next/server";
import { buildVerifySignatureCandidates, type PayzyFieldValues } from "@/lib/payzy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { payzyData, responseCode, signature } = await request.json();

    if (!payzyData || !responseCode || !signature) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const fields = payzyData as PayzyFieldValues;
    const candidates = buildVerifySignatureCandidates(fields, responseCode);

    const normalize = (s: string) => decodeURIComponent(s).replace(/\s/g, "+");
    const receivedNorm = normalize(signature);

    const match = candidates.find((c) => normalize(c.signature) === receivedNorm);

    console.log("[Payzy Verify] received sig:", receivedNorm);
    for (const c of candidates) {
      const mark = normalize(c.signature) === receivedNorm ? "✓" : "✗";
      console.log(`[Payzy Verify]  ${mark} ${c.variant}: ${normalize(c.signature)}`);
    }
    console.log("[Payzy Verify] match:", match ? match.variant : "NONE", "| responseCode:", responseCode);

    if (match && responseCode === "00") {
      return NextResponse.json({ success: true, status: "paid", matchedVariant: match.variant });
    }

    if (match && responseCode !== "00") {
      return NextResponse.json({
        success: false,
        status: "failed",
        message: "Payment was not successful",
      });
    }

    return NextResponse.json(
      {
        success: false,
        status: "invalid",
        message: "Signature verification failed",
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("Payzy verify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
