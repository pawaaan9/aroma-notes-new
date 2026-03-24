import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

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
    } = body;

    if (!customerEmail || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sendOrderConfirmationEmail({
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
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Email] Order confirmation failed:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
