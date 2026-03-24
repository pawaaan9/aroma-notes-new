import { NextRequest, NextResponse } from "next/server";
import { sendShippedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      address,
      city,
      phone,
      deliveryDays,
    } = body;

    if (!customerEmail || !orderNumber || !deliveryDays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendShippedEmail({
      orderNumber,
      customerName,
      customerEmail,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      address,
      city,
      phone,
      deliveryDays: Number(deliveryDays),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Email] Shipped notification failed:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
