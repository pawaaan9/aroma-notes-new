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

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type PaymentMethod = "cod" | "bank_deposit";

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
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
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
    status: data.status ?? "pending",
    paymentMethod: data.paymentMethod ?? "cod",
    bankSlipUrl: data.bankSlipUrl ?? undefined,
    customer: {
      name: data.customer?.name ?? "",
      email: data.customer?.email ?? "",
      phone: data.customer?.phone ?? "",
      address: data.customer?.address ?? "",
      city: data.customer?.city ?? "",
      notes: data.customer?.notes ?? "",
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
    status: "pending" as OrderStatus,
    paymentMethod: input.paymentMethod,
    customer: input.customer,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (input.bankSlipUrl) {
    docData.bankSlipUrl = input.bankSlipUrl;
  }

  const ref = await addDoc(collection(db, "orders"), docData);
  return {
    id: ref.id,
    orderNumber,
    items: input.items,
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    total: input.total,
    status: "pending",
    paymentMethod: input.paymentMethod,
    bankSlipUrl: input.bankSlipUrl,
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
