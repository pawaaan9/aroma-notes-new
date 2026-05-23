export type InvoiceLineItem = {
  brand?: string | null;
  name: string;
  note?: string | null;
  size?: string | null;
  quantity: number;
  /** Final unit price used for line total (advance price on advanced invoices). */
  unitPrice: number;
  /** Catalog / list price per unit (advanced invoices). */
  retailPrice?: number;
  /** Advance payment price per unit (advanced invoices). */
  advancedPrice?: number;
};

export type InvoiceCustomer = {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  orderNumber?: string;
  invoiceDate: Date;
  dueDate?: Date | null;
  paymentLabel: string;
  billedTo: InvoiceCustomer;
  shippedTo?: InvoiceCustomer | null;
  shippingMethod?: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discount?: number;
  deliveryFee: number;
  total: number;
  /** Sum of retail (catalog) prices × qty — advanced invoices only. */
  retailSubtotal?: number;
  /** Invoice-level advance payment due now — advanced invoices only. */
  advanceAmount?: number;
  /** Remaining balance after advance — advanced invoices only. */
  balanceDue?: number;
  showAdvancedBreakdown?: boolean;
  status: "paid" | "awaiting" | "cancelled" | "advance" | "draft";
  notes?: string;
  payzyPlan?: {
    installments: number;
    perInstallment: number;
  } | null;
};

export function formatLkrShort(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(Math.round(amount));
  return `${sign}LKR ${abs.toLocaleString("en-LK")}`;
}

export function formatInvoiceDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
