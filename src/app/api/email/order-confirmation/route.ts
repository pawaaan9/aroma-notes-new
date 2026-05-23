import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail, type OrderEmailData } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
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
      state,
      zip,
      phone,
      notes,
      bankSlipUrl,
    } = body;

    if (!customerEmail || !orderNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedItems: OrderEmailData["items"] = Array.isArray(items)
      ? items.map((it: Record<string, unknown>) => ({
          productId: typeof it.productId === "string" ? it.productId : undefined,
          name: String(it.name ?? ""),
          brand: (it.brand as string | null | undefined) ?? null,
          size: (it.size as string | null | undefined) ?? null,
          quantity: Number(it.quantity) || 0,
          price: Number(it.price) || 0,
        }))
      : [];

    const payload: OrderEmailData = {
      orderNumber: String(orderNumber),
      customerName: String(customerName ?? "Customer"),
      customerEmail: String(customerEmail),
      items: normalizedItems,
      subtotal: Number(subtotal) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      total: Number(total) || 0,
      paymentMethod: String(paymentMethod ?? "cod"),
      address: String(address ?? ""),
      city: String(city ?? ""),
      phone: String(phone ?? ""),
      ...(typeof state === "string" && state.trim() ? { state: state.trim() } : {}),
      ...(typeof zip === "string" && zip.trim() ? { zip: zip.trim() } : {}),
      ...(typeof notes === "string" && notes.trim() ? { notes: notes.trim() } : {}),
      ...(typeof orderId === "string" && orderId.trim() ? { orderId: orderId.trim() } : {}),
      ...(typeof bankSlipUrl === "string" && bankSlipUrl.trim() ? { bankSlipUrl: bankSlipUrl.trim() } : {}),
    };

    await sendOrderConfirmationEmail(payload);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Email] Order confirmation failed:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
