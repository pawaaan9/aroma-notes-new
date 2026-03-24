import {
  collection,
  doc,
  increment,
  onSnapshot,
  setDoc,
  serverTimestamp,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CustomerSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderNumber: string;
  lastOrderAt: Date;
};

type CustomerInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
};

function customerDocId(customer: CustomerInput): string {
  const email = customer.email.trim().toLowerCase();
  if (email) return `email_${email}`;
  const phone = customer.phone.trim().replace(/\s+/g, "");
  if (phone) return `phone_${phone}`;
  return `guest_${Date.now()}`;
}

export async function upsertCustomerFromOrder(params: {
  customer: CustomerInput;
  orderNumber: string;
  total: number;
}): Promise<void> {
  const { customer, orderNumber, total } = params;
  const id = customerDocId(customer);
  const ref = doc(db, "customers", id);

  await setDoc(
    ref,
    {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      city: customer.city,
      address: customer.address,
      totalOrders: increment(1),
      totalSpent: increment(Number(total) || 0),
      lastOrderNumber: orderNumber,
      lastOrderAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDoc(id: string, data: Record<string, any>): CustomerSummary {
  const toDate = (v: unknown): Date => {
    if (v instanceof Timestamp) return v.toDate();
    if (v instanceof Date) return v;
    return new Date(0);
  };
  return {
    id,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    city: data.city ?? "",
    address: data.address ?? "",
    totalOrders: Number(data.totalOrders) || 0,
    totalSpent: Number(data.totalSpent) || 0,
    lastOrderNumber: data.lastOrderNumber ?? "",
    lastOrderAt: toDate(data.lastOrderAt),
  };
}

export function subscribeToCustomers(
  callback: (customers: CustomerSummary[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "customers"), (snap) => {
    const customers = snap.docs.map((d) => mapDoc(d.id, d.data()));
    customers.sort((a, b) => b.lastOrderAt.getTime() - a.lastOrderAt.getTime());
    callback(customers);
  });
}

