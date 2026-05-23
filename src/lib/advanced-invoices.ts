import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AdvancedInvoiceItem = {
  productId?: string | null;
  brand?: string | null;
  name: string;
  note?: string | null;
  size?: string | null;
  quantity: number;
  /** Catalog / list price per unit. */
  retailPrice: number;
};

export type AdvancedInvoiceCustomer = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type AdvancedInvoice = {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid";
  customer: AdvancedInvoiceCustomer;
  items: AdvancedInvoiceItem[];
  /** Retail subtotal (sum of line items). */
  subtotal: number;
  /** Catalog retail subtotal — same as subtotal; kept for clarity in UI/PDF. */
  retailSubtotal: number;
  discount: number;
  deliveryFee: number;
  /** Full order total = retailSubtotal − discount + delivery. */
  total: number;
  /** Single advance payment amount due now (invoice-level, not per product). */
  advanceAmount: number;
  notes?: string;
  emailedTo: { email: string; sentAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
};

export type CreateAdvancedInvoicePayload = {
  customer: AdvancedInvoiceCustomer;
  items: AdvancedInvoiceItem[];
  retailSubtotal: number;
  deliveryFee: number;
  total: number;
  advanceAmount: number;
  notes?: string;
  createdBy: string;
};

export function generateAdvancedInvoiceNumber(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AN-ADV-${yy}${mm}${dd}-${tail}`;
}

export async function createAdvancedInvoice(
  payload: CreateAdvancedInvoicePayload,
): Promise<{ id: string; invoiceNumber: string }> {
  const invoiceNumber = generateAdvancedInvoiceNumber();
  const ref = await addDoc(collection(db, "advanced-invoices"), {
    invoiceNumber,
    status: "draft",
    customer: payload.customer,
    items: payload.items,
    retailSubtotal: payload.retailSubtotal,
    subtotal: payload.retailSubtotal,
    discount: 0,
    deliveryFee: payload.deliveryFee,
    total: payload.total,
    advanceAmount: payload.advanceAmount,
    notes: (payload.notes ?? "").trim(),
    emailedTo: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: payload.createdBy,
  });
  return { id: ref.id, invoiceNumber };
}

export async function markAdvancedInvoiceSent(id: string, email: string): Promise<void> {
  await updateDoc(doc(db, "advanced-invoices", id), {
    status: "sent",
    updatedAt: serverTimestamp(),
    emailedTo: arrayUnion({ email, sentAt: Timestamp.now() }),
  });
}

function toDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
}

function mapDoc(id: string, data: Record<string, unknown>): AdvancedInvoice {
  const customer = (data.customer as Record<string, unknown> | undefined) ?? {};
  return {
    id,
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
    items: ((data.items as Record<string, unknown>[]) ?? []).map((it) => ({
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
    })),
    subtotal: Number(data.subtotal) || 0,
    retailSubtotal:
      Number(data.retailSubtotal) ||
      Number(data.subtotal) ||
      ((data.items as Record<string, unknown>[]) ?? []).reduce((s, it) => {
        const qty = Number(it.quantity) || 0;
        const retail =
          Number(it.retailPrice) ||
          Number(it.advancedPrice) ||
          Number(it.unitPrice) ||
          0;
        return s + qty * retail;
      }, 0),
    discount: Number(data.discount) || 0,
    deliveryFee: Number(data.deliveryFee) || 0,
    total: Number(data.total) || 0,
    advanceAmount:
      Number(data.advanceAmount) ||
      Number(data.total) ||
      0,
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

export function subscribeToAdvancedInvoices(
  cb: (invoices: AdvancedInvoice[]) => void,
): Unsubscribe {
  const q = query(collection(db, "advanced-invoices"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => mapDoc(d.id, d.data())));
  });
}
