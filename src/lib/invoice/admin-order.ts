import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import type { Order, OrderStatus, PaymentMethod } from "@/lib/orders";

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

function normalizeStatus(status: unknown): OrderStatus {
  if (status === "completed") return "sent_to_courier";
  if (status === "pending" || status === "processing") return "confirmed";
  if (
    status === "confirmed" ||
    status === "sent_to_courier" ||
    status === "cancelled"
  ) {
    return status as OrderStatus;
  }
  return "confirmed";
}

export async function fetchOrderAdmin(orderId: string): Promise<Order | null> {
  const snap = await adminDb().collection("orders").doc(orderId).get();
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown> | undefined;
  if (!data) return null;

  const customer = (data.customer as Record<string, unknown> | undefined) ?? {};

  return {
    id: snap.id,
    orderNumber: (data.orderNumber as string) ?? "",
    items: ((data.items as Record<string, unknown>[]) ?? []).map((it) => ({
      productId: (it.productId as string) ?? "",
      name: (it.name as string) ?? "",
      imageUrl: (it.imageUrl as string | undefined) ?? undefined,
      brand: (it.brand as string | null | undefined) ?? null,
      size: (it.size as string | null | undefined) ?? null,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
    })),
    subtotal: Number(data.subtotal) || 0,
    deliveryFee: Number(data.deliveryFee) || 0,
    total: Number(data.total) || 0,
    status: normalizeStatus(data.status),
    paymentMethod: ((data.paymentMethod as PaymentMethod) ?? "cod") as PaymentMethod,
    bankSlipUrl: (data.bankSlipUrl as string | undefined) ?? undefined,
    payzyPaymentStatus: (data.payzyPaymentStatus as string | undefined) ?? undefined,
    customer: {
      name: (customer.name as string) ?? "",
      email: (customer.email as string) ?? "",
      phone: (customer.phone as string) ?? "",
      address: (customer.address as string) ?? "",
      city: (customer.city as string) ?? "",
      ...(typeof customer.state === "string" && customer.state.trim()
        ? { state: customer.state.trim() }
        : {}),
      ...(typeof customer.zip === "string" && customer.zip.trim()
        ? { zip: customer.zip.trim() }
        : {}),
      ...(typeof customer.notes === "string" && customer.notes.trim()
        ? { notes: customer.notes.trim() }
        : {}),
    },
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}
