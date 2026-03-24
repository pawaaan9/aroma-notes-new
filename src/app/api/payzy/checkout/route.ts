import { NextRequest, NextResponse } from "next/server";
import {
  buildPayzyFields,
  buildCheckoutSignature,
  CHECKOUT_SIGNED_FIELD_NAMES,
  PAYZY_API_URL,
} from "@/lib/payzy";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      amount,
      deliveryFee,
      firstName,
      lastName,
      company,
      email,
      phone,
      address,
      city,
      state,
      zip,
      origin,
    } = body;

    const numAmount = Number(amount);
    if (!orderId || !origin || !Number.isFinite(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Missing required fields or invalid amount" },
        { status: 400 },
      );
    }

    const responseUrl = `${origin}/payzy-response`;

    const fields = buildPayzyFields({
      orderId: String(orderId),
      amount: numAmount,
      deliveryFee: Number(deliveryFee) || 0,
      firstName: String(firstName || "").trim() || "Customer",
      lastName: String(lastName || "").trim() || "N/A",
      company: String(company || ""),
      email: String(email || ""),
      phone: String(phone || ""),
      address: String(address || ""),
      city: String(city || ""),
      state: String(state || ""),
      zip: String(zip || ""),
      responseUrl,
    });

    const signature = buildCheckoutSignature(fields);

    // Send ALL fields as strings (PayZy may reject numeric JSON types)
    const payload: Record<string, string> = {
      ...fields,
      signed_field_names: CHECKOUT_SIGNED_FIELD_NAMES,
      signature,
    };

    console.log("[Payzy] POST to", PAYZY_API_URL, "| amount:", fields.x_amount, "| order:", fields.x_order_id);

    const apiRes = await fetch(PAYZY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const responseText = await apiRes.text();
    console.log("[Payzy] Response:", apiRes.status, responseText.slice(0, 300));

    if (!apiRes.ok) {
      return NextResponse.json(
        { error: "Payzy API request failed", details: responseText },
        { status: 502 },
      );
    }

    let data: {
      url?: unknown;
      data?: {
        url?: unknown;
      };
    };
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Invalid response from Payzy" },
        { status: 502 },
      );
    }

    const redirectUrl = String(data?.data?.url || data?.url || "");
    if (!redirectUrl) {
      return NextResponse.json(
        { error: "No checkout URL returned from Payzy" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: redirectUrl, payzyData: fields });
  } catch (error) {
    console.error("Payzy checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
