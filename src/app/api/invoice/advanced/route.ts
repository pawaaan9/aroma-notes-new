import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, verifyAdminFromRequest } from "@/lib/firebase-admin";
import { getStoreDeliveryFee } from "@/lib/settings-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  items?: {
    productId?: string | null;
    brand?: string | null;
    name?: string;
    note?: string | null;
    size?: string | null;
    quantity?: number | string;
    retailPrice?: number | string;
  }[];
  advanceAmount?: number | string;
  notes?: string;
};

function generateAdvancedInvoiceNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AN-ADV-${yy}${mm}${dd}-${tail}`;
}

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAdminFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const customer = body.customer ?? {};
    const customerName = (customer.name ?? "").trim();
    if (!customerName) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }

    const rawItems = Array.isArray(body.items) ? body.items : [];
    const items = rawItems
      .map((it) => {
        const quantity = Math.max(0, Math.floor(Number(it.quantity) || 0));
        const retailPrice = Math.max(0, Number(it.retailPrice) || 0);
        const name = String(it.name ?? "").trim();
        const productId = it.productId ?? null;
        return {
          productId,
          brand: it.brand ?? null,
          name,
          note: it.note ?? null,
          size: it.size ?? null,
          quantity,
          retailPrice,
        };
      })
      .filter((it) => it.productId && it.name && it.quantity > 0);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Add at least one product from your catalog (10 ml or 100 ml)." },
        { status: 400 },
      );
    }

    const retailSubtotal = items.reduce((s, it) => s + it.quantity * it.retailPrice, 0);
    const deliveryFee = retailSubtotal > 0 ? await getStoreDeliveryFee() : 0;
    const total = retailSubtotal + deliveryFee;
    const advanceAmount = Math.max(0, Number(body.advanceAmount) || 0);

    if (advanceAmount <= 0) {
      return NextResponse.json(
        { error: "Enter the advance payment amount for this invoice." },
        { status: 400 },
      );
    }
    if (advanceAmount > total) {
      return NextResponse.json(
        { error: "Advance amount cannot exceed the order total." },
        { status: 400 },
      );
    }

    const invoiceNumber = generateAdvancedInvoiceNumber();
    const docData = {
      invoiceNumber,
      status: "draft" as const,
      customer: {
        name: customerName,
        email: (customer.email ?? "").trim(),
        phone: (customer.phone ?? "").trim(),
        address: (customer.address ?? "").trim(),
        city: (customer.city ?? "").trim(),
        ...(customer.state?.trim() ? { state: customer.state.trim() } : {}),
        ...(customer.zip?.trim() ? { zip: customer.zip.trim() } : {}),
      },
      items,
      retailSubtotal,
      subtotal: retailSubtotal,
      discount: 0,
      deliveryFee,
      total,
      advanceAmount,
      notes: (body.notes ?? "").trim(),
      emailedTo: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: uid,
    };

    const ref = await adminDb().collection("advanced-invoices").add(docData);

    return NextResponse.json({
      id: ref.id,
      invoiceNumber,
      total,
      advanceAmount,
      retailSubtotal,
    });
  } catch (err) {
    console.error("[AdvancedInvoice] Create failed:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 400 });
  }
}
