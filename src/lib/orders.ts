import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type OrderStatus = "pending" | "processing" | "confirmed" | "sent_to_courier" | "cancelled";

export type PaymentMethod = "cod" | "bank_deposit" | "payzy" | "advance";

export type OrderItem = {
  productId: string;
  name: string;
  imageUrl?: string;
  brand?: string | null;
  size?: string | null;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  bankSlipUrl?: string;
  payzyPaymentStatus?: string;
  /** For advance-payment orders: the upfront amount the customer paid. */
  advanceAmount?: number;
  /** For advance-payment orders: link back to the source advanced-invoice doc. */
  advanceInvoiceId?: string;
  /** For advance-payment orders: invoice number from advanced-invoices collection. */
  advanceInvoiceNumber?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type CreateOrderInput = Omit<Order, "id" | "orderNumber" | "status" | "createdAt" | "updatedAt">;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateOrderNumber(): string {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AN-${y}${m}${d}-${rand}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDocToOrder(id: string, data: Record<string, any>): Order {
  const toDate = (v: unknown): Date => {
    if (v instanceof Timestamp) return v.toDate();
    if (v instanceof Date) return v;
    return new Date();
  };

  const normalizeStatus = (status: unknown): OrderStatus => {
    if (status === "completed") return "sent_to_courier";
    if (status === "pending" || status === "processing") return "confirmed";
    if (status === "confirmed" || status === "sent_to_courier" || status === "cancelled") {
      return status as OrderStatus;
    }
    return "confirmed";
  };

  return {
    id,
    orderNumber: data.orderNumber ?? "",
    items: (data.items ?? []).map((it: Record<string, unknown>) => ({
      productId: it.productId ?? "",
      name: it.name ?? "",
      imageUrl: it.imageUrl ?? undefined,
      brand: it.brand ?? null,
      size: it.size ?? null,
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 1,
    })),
    subtotal: Number(data.subtotal) || 0,
    deliveryFee: Number(data.deliveryFee) || 0,
    total: Number(data.total) || 0,
    status: normalizeStatus(data.status),
    paymentMethod: data.paymentMethod ?? "cod",
    bankSlipUrl: data.bankSlipUrl ?? undefined,
    payzyPaymentStatus: data.payzyPaymentStatus ?? undefined,
    ...(typeof data.advanceAmount === "number" ? { advanceAmount: Number(data.advanceAmount) } : {}),
    ...(typeof data.advanceInvoiceId === "string" ? { advanceInvoiceId: data.advanceInvoiceId } : {}),
    ...(typeof data.advanceInvoiceNumber === "string" ? { advanceInvoiceNumber: data.advanceInvoiceNumber } : {}),
    customer: {
      name: data.customer?.name ?? "",
      email: data.customer?.email ?? "",
      phone: data.customer?.phone ?? "",
      address: data.customer?.address ?? "",
      city: data.customer?.city ?? "",
      ...(typeof data.customer?.state === "string" && data.customer.state.trim()
        ? { state: data.customer.state.trim() }
        : {}),
      ...(typeof data.customer?.zip === "string" && data.customer.zip.trim()
        ? { zip: data.customer.zip.trim() }
        : {}),
      ...(data.customer?.notes ? { notes: String(data.customer.notes) } : {}),
    },
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

/* ------------------------------------------------------------------ */
/*  CRUD                                                               */
/* ------------------------------------------------------------------ */

/** Create a new order – returns the created Order object. */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const orderNumber = generateOrderNumber();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const docData: Record<string, any> = {
    orderNumber,
    items: input.items,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    status: "confirmed" as OrderStatus,
    paymentMethod: input.paymentMethod,
    customer: input.customer,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.bankSlipUrl) {
    docData.bankSlipUrl = input.bankSlipUrl;
  }

  if (input.paymentMethod === "payzy") {
    docData.payzyPaymentStatus = "awaiting";
  }

  if (typeof input.advanceAmount === "number" && input.advanceAmount > 0) {
    docData.advanceAmount = input.advanceAmount;
  }
  if (input.advanceInvoiceId) {
    docData.advanceInvoiceId = input.advanceInvoiceId;
  }
  if (input.advanceInvoiceNumber) {
    docData.advanceInvoiceNumber = input.advanceInvoiceNumber;
  }

  const ref = await addDoc(collection(db, "orders"), docData);
  return {
    id: ref.id,
    orderNumber,
    items: input.items,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    status: "confirmed",
    paymentMethod: input.paymentMethod,
    bankSlipUrl: input.bankSlipUrl,
    advanceAmount: input.advanceAmount,
    advanceInvoiceId: input.advanceInvoiceId,
    advanceInvoiceNumber: input.advanceInvoiceNumber,
    customer: input.customer,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/** Fetch all orders, newest first. */
export async function fetchAllOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDocToOrder(d.id, d.data()));
}

/** Fetch orders filtered by status. */
export async function fetchOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDocToOrder(d.id, d.data()));
}

/** Fetch a single order by ID. */
export async function fetchOrderById(orderId: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", orderId));
  if (!snap.exists()) return null;
  return mapDocToOrder(snap.id, snap.data());
}

/** Update order status. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/** Real-time listener for all orders (admin dashboard). */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
): Unsubscribe {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => mapDocToOrder(d.id, d.data()));
    callback(orders);
  });
}
