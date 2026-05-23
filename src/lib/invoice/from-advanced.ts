import type { AdvancedInvoice } from "@/lib/advanced-invoices";
import type { InvoiceData } from "./types";

export function invoiceFromAdvanced(inv: AdvancedInvoice): InvoiceData {
  const retailSubtotal =
    inv.retailSubtotal ||
    inv.items.reduce((s, it) => s + it.quantity * it.retailPrice, 0);
  const orderTotal =
    inv.total ||
    Math.max(0, retailSubtotal - inv.discount + inv.deliveryFee);
  const advanceAmount = inv.advanceAmount ?? orderTotal;
  const balanceDue = Math.max(0, orderTotal - advanceAmount);

  return {
    invoiceNumber: inv.invoiceNumber,
    invoiceDate: inv.createdAt,
    paymentLabel: "Advance Payment",
    billedTo: {
      name: inv.customer.name,
      email: inv.customer.email,
      phone: inv.customer.phone,
      address: inv.customer.address,
      city: inv.customer.city,
      state: inv.customer.state,
      zip: inv.customer.zip,
    },
    items: inv.items.map((it) => ({
      brand: it.brand ?? null,
      name: it.name,
      note: it.note ?? "Exclusive Import · Yusuf Bhai Collection",
      size: it.size ?? null,
      quantity: it.quantity,
      unitPrice: it.retailPrice,
      retailPrice: it.retailPrice,
    })),
    subtotal: retailSubtotal,
    retailSubtotal,
    advanceAmount,
    balanceDue,
    showAdvancedBreakdown: true,
    discount: inv.discount,
    deliveryFee: inv.deliveryFee,
    total: orderTotal,
    status: "advance",
    notes: inv.notes,
  };
}
