import type { Order } from "@/lib/orders";

/** Parse order JSON sent from the admin client (dates as ISO strings). */
export function parseOrderPayload(raw: unknown): Order | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = String(o.id ?? "").trim();
  const orderNumber = String(o.orderNumber ?? "").trim();
  const items = Array.isArray(o.items) ? o.items : [];
  const customer = (o.customer as Record<string, unknown> | undefined) ?? {};
  if (!id || !orderNumber || items.length === 0) return null;

  const paymentMethod = o.paymentMethod;
  if (paymentMethod !== "cod" && paymentMethod !== "bank_deposit" && paymentMethod !== "payzy") {
    return null;
  }

  const status = o.status;
  const validStatus =
    status === "pending" ||
    status === "processing" ||
    status === "confirmed" ||
    status === "sent_to_courier" ||
    status === "cancelled";

  return {
    id,
    orderNumber,
    items: items.map((it) => {
      const row = it as Record<string, unknown>;
      return {
        productId: String(row.productId ?? ""),
        name: String(row.name ?? ""),
        imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
        brand: row.brand != null ? String(row.brand) : null,
        size: row.size != null ? String(row.size) : null,
        price: Number(row.price) || 0,
        quantity: Number(row.quantity) || 1,
      };
    }),
    subtotal: Number(o.subtotal) || 0,
    deliveryFee: Number(o.deliveryFee) || 0,
    total: Number(o.total) || 0,
    status: validStatus ? status : "confirmed",
    paymentMethod,
    bankSlipUrl: o.bankSlipUrl ? String(o.bankSlipUrl) : undefined,
    payzyPaymentStatus: o.payzyPaymentStatus ? String(o.payzyPaymentStatus) : undefined,
    customer: {
      name: String(customer.name ?? ""),
      email: String(customer.email ?? ""),
      phone: String(customer.phone ?? ""),
      address: String(customer.address ?? ""),
      city: String(customer.city ?? ""),
      state: customer.state ? String(customer.state) : undefined,
      zip: customer.zip ? String(customer.zip) : undefined,
      notes: customer.notes ? String(customer.notes) : undefined,
    },
    createdAt: o.createdAt ? new Date(String(o.createdAt)) : new Date(),
    updatedAt: o.updatedAt ? new Date(String(o.updatedAt)) : new Date(),
  };
}
