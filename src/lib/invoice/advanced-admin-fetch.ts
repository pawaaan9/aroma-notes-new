import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { AdvancedInvoice } from "@/lib/advanced-invoices";

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

export async function fetchAdvancedInvoiceAdmin(id: string): Promise<AdvancedInvoice | null> {
  const snap = await adminDb().collection("advanced-invoices").doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown> | undefined;
  if (!data) return null;
  const customer = (data.customer as Record<string, unknown> | undefined) ?? {};

  const items = ((data.items as Record<string, unknown>[]) ?? []).map((it) => ({
    productId: (it.productId as string | null) ?? null,
    brand: (it.brand as string | null) ?? null,
    name: (it.name as string) ?? "",
    note: (it.note as string | null) ?? null,
    size: (it.size as string | null) ?? null,
    quantity: Number(it.quantity) || 0,
    retailPrice:
      Number(it.retailPrice) ||
      Number(it.advancedPrice) ||
      Number(it.unitPrice) ||
      0,
  }));

  const retailSubtotal =
    Number(data.retailSubtotal) ||
    Number(data.subtotal) ||
    items.reduce((s, it) => s + it.quantity * it.retailPrice, 0);
  const total = Number(data.total) || 0;

  return {
    id: snap.id,
    invoiceNumber: (data.invoiceNumber as string) ?? "",
    status: ((data.status as string) ?? "draft") as AdvancedInvoice["status"],
    customer: {
      name: (customer.name as string) ?? "",
      email: (customer.email as string) ?? "",
      phone: (customer.phone as string) ?? "",
      address: (customer.address as string) ?? "",
      city: (customer.city as string) ?? "",
      state: (customer.state as string) ?? undefined,
      zip: (customer.zip as string) ?? undefined,
    },
    items,
    subtotal: Number(data.subtotal) || retailSubtotal,
    retailSubtotal,
    discount: Number(data.discount) || 0,
    deliveryFee: Number(data.deliveryFee) || 0,
    total,
    advanceAmount: Number(data.advanceAmount) || total,
    notes: (data.notes as string) ?? "",
    emailedTo: ((data.emailedTo as Record<string, unknown>[]) ?? []).map((e) => ({
      email: (e.email as string) ?? "",
      sentAt: toDate(e.sentAt),
    })),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    createdBy: (data.createdBy as string) ?? undefined,
  };
}
