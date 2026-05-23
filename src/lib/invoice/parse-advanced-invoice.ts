import type { AdvancedInvoice } from "@/lib/advanced-invoices";

/** Parse invoice JSON sent from the admin client (dates as ISO strings). */
export function parseAdvancedInvoicePayload(raw: unknown): AdvancedInvoice | null {
  if (!raw || typeof raw !== "object") return null;
  const inv = raw as Record<string, unknown>;
  const customer = (inv.customer as Record<string, unknown> | undefined) ?? {};
  const items = Array.isArray(inv.items) ? inv.items : [];
  const invoiceNumber = String(inv.invoiceNumber ?? "").trim();
  const id = String(inv.id ?? "").trim();
  if (!invoiceNumber || !id || items.length === 0) return null;

  return {
    id,
    invoiceNumber,
    status: ((inv.status as string) ?? "draft") as AdvancedInvoice["status"],
    customer: {
      name: String(customer.name ?? ""),
      email: customer.email ? String(customer.email) : undefined,
      phone: customer.phone ? String(customer.phone) : undefined,
      address: customer.address ? String(customer.address) : undefined,
      city: customer.city ? String(customer.city) : undefined,
      state: customer.state ? String(customer.state) : undefined,
      zip: customer.zip ? String(customer.zip) : undefined,
    },
    items: items.map((it) => {
      const row = it as Record<string, unknown>;
      return {
        productId: (row.productId as string | null) ?? null,
        brand: (row.brand as string | null) ?? null,
        name: String(row.name ?? ""),
        note: (row.note as string | null) ?? null,
        size: (row.size as string | null) ?? null,
        quantity: Number(row.quantity) || 0,
        retailPrice: Number(row.retailPrice) || 0,
      };
    }),
    subtotal: Number(inv.subtotal) || 0,
    retailSubtotal: Number(inv.retailSubtotal) || Number(inv.subtotal) || 0,
    discount: Number(inv.discount) || 0,
    deliveryFee: Number(inv.deliveryFee) || 0,
    total: Number(inv.total) || 0,
    advanceAmount: Number(inv.advanceAmount) || Number(inv.total) || 0,
    notes: inv.notes ? String(inv.notes) : "",
    emailedTo: [],
    createdAt: inv.createdAt ? new Date(String(inv.createdAt)) : new Date(),
    updatedAt: inv.updatedAt ? new Date(String(inv.updatedAt)) : new Date(),
    createdBy: inv.createdBy ? String(inv.createdBy) : undefined,
  };
}
