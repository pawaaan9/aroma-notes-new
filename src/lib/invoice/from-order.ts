import type { Order } from "@/lib/orders";
import type { InvoiceData, InvoiceLineItem } from "./types";

function invoiceNumberForOrder(o: Order): string {
  const year = o.createdAt.getFullYear();
  const tail = (o.orderNumber || o.id).replace(/[^A-Za-z0-9]/g, "").slice(-6).toUpperCase();
  return `AN-${year}-${tail || "000000"}`;
}

function paymentLabelForOrder(o: Order): string {
  switch (o.paymentMethod) {
    case "cod":
      return "Cash on Delivery";
    case "bank_deposit":
      return "Bank Deposit";
    case "payzy":
      return "Payzy";
    case "advance":
      return "Advanced Payment";
    default:
      return String(o.paymentMethod);
  }
}

function statusForOrder(o: Order): InvoiceData["status"] {
  if (o.status === "cancelled") return "cancelled";
  if (o.paymentMethod === "advance") return "advance";
  if (o.paymentMethod === "payzy") {
    return o.payzyPaymentStatus === "success" ? "paid" : "awaiting";
  }
  if (o.paymentMethod === "bank_deposit" || o.paymentMethod === "cod") {
    return o.status === "sent_to_courier" ? "paid" : "awaiting";
  }
  return "awaiting";
}

export function invoiceFromOrder(o: Order): InvoiceData {
  const items: InvoiceLineItem[] = o.items.map((it) => ({
    brand: it.brand ?? null,
    name: it.name,
    note: "Exclusive Import · Yusuf Bhai Collection",
    size: it.size ?? null,
    quantity: it.quantity,
    unitPrice: it.price,
    retailPrice: it.price,
  }));

  const payzyPlan =
    o.paymentMethod === "payzy" && o.total > 0
      ? {
          installments: 4,
          perInstallment: Math.round(o.total / 4),
        }
      : null;

  const isAdvance = o.paymentMethod === "advance";
  const advanceAmount = isAdvance
    ? Math.max(0, Math.min(o.advanceAmount ?? o.total, o.total))
    : undefined;
  const balanceDue = isAdvance ? Math.max(0, o.total - (advanceAmount ?? 0)) : undefined;

  return {
    invoiceNumber: invoiceNumberForOrder(o),
    orderNumber: o.orderNumber,
    invoiceDate: o.createdAt,
    paymentLabel: paymentLabelForOrder(o),
    billedTo: {
      name: o.customer.name,
      email: o.customer.email,
      phone: o.customer.phone,
      address: o.customer.address,
      city: o.customer.city,
      state: o.customer.state,
      zip: o.customer.zip,
    },
    items,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    status: statusForOrder(o),
    payzyPlan,
    notes: o.customer.notes,
    ...(isAdvance
      ? {
          retailSubtotal: o.subtotal,
          advanceAmount,
          balanceDue,
          showAdvancedBreakdown: true,
        }
      : {}),
  };
}
