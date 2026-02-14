"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  subscribeToOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
  type PaymentMethod,
} from "@/lib/orders";
import { formatLkr } from "@/utils/currency";

type Tab = "all" | OrderStatus;

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    dot: "bg-amber-500",
  },
  processing: {
    label: "Processing",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
    dot: "bg-blue-500",
  },
  completed: {
    label: "Completed",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const c = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text} font-saira`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; bg: string; text: string; icon: string }> = {
  cod: { label: "Cash on Delivery", bg: "bg-amber-500/10", text: "text-amber-400", icon: "cash" },
  bank_deposit: { label: "Bank Deposit", bg: "bg-blue-500/10", text: "text-blue-400", icon: "bank" },
};

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const c = PAYMENT_CONFIG[method] ?? PAYMENT_CONFIG.cod;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${c.bg} ${c.text} font-saira`}>
      {c.icon === "bank" ? (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      )}
      {c.label}
    </span>
  );
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* ------------------------------------------------------------------ */
/*  Order Detail Modal                                                 */
/* ------------------------------------------------------------------ */
function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const [slipExpanded, setSlipExpanded] = useState(false);

  const handleStatus = async (status: OrderStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(order.id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Expanded slip viewer */}
      {slipExpanded && order.bankSlipUrl && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSlipExpanded(false)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              onClick={() => setSlipExpanded(false)}
              className="absolute -top-10 right-0 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.bankSlipUrl}
              alt="Bank deposit slip"
              className="max-h-[85vh] max-w-full rounded-xl object-contain"
            />
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-auto rounded-2xl border border-white/10 bg-gray-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gray-900/95 backdrop-blur-md px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white font-saira">
              Order {order.orderNumber}
            </h2>
            <p className="text-xs text-gray-400 font-saira">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status + Payment + actions */}
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={order.status} />
            <PaymentBadge method={order.paymentMethod} />
            <div className="ml-auto flex flex-wrap gap-2">
              {order.status !== "processing" && order.status !== "completed" && (
                <button
                  disabled={updating}
                  onClick={() => handleStatus("processing")}
                  className="rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/30 disabled:opacity-50 font-saira"
                >
                  Mark Processing
                </button>
              )}
              {order.status !== "completed" && (
                <button
                  disabled={updating}
                  onClick={() => handleStatus("completed")}
                  className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/30 disabled:opacity-50 font-saira"
                >
                  Mark Completed
                </button>
              )}
              {order.status !== "cancelled" && order.status !== "completed" && (
                <button
                  disabled={updating}
                  onClick={() => handleStatus("cancelled")}
                  className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50 font-saira"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          {/* Bank slip (shown when bank_deposit) */}
          {order.paymentMethod === "bank_deposit" && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-400 font-saira uppercase tracking-wider">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
                Bank Deposit Slip
              </h3>
              {order.bankSlipUrl ? (
                <div
                  className="group relative w-full max-w-xs cursor-pointer overflow-hidden rounded-lg border border-white/10"
                  onClick={() => setSlipExpanded(true)}
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={order.bankSlipUrl}
                      alt="Bank deposit slip"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="320px"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                    <span className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 font-saira">
                      Click to enlarge
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 font-saira italic">
                  No slip uploaded
                </p>
              )}
            </div>
          )}

          {/* Customer info */}
          <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300 font-saira uppercase tracking-wider">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500 font-saira">Name</p>
                <p className="text-sm font-medium text-white font-saira">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-saira">Phone</p>
                <p className="text-sm font-medium text-white font-saira">
                  {order.customer.phone}
                </p>
              </div>
              {order.customer.email && (
                <div>
                  <p className="text-xs text-gray-500 font-saira">Email</p>
                  <p className="text-sm font-medium text-white font-saira">
                    {order.customer.email}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 font-saira">City</p>
                <p className="text-sm font-medium text-white font-saira">
                  {order.customer.city}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 font-saira">Address</p>
                <p className="text-sm font-medium text-white font-saira">
                  {order.customer.address}
                </p>
              </div>
              {order.customer.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 font-saira">Notes</p>
                  <p className="text-sm text-gray-300 font-saira italic">
                    {order.customer.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order items */}
          <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300 font-saira uppercase tracking-wider">
              Items ({order.items.length})
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-gray-700/40 p-3"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-600 border border-gray-500">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white font-saira line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400 font-saira">
                      {item.brand ? `${item.brand} • ` : ""}
                      {item.size ? `${item.size} • ` : ""}
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white font-saira">
                    {formatLkr(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-saira">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatLkr(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-saira">
                <span className="text-gray-400">Delivery Fee</span>
                <span className="text-white">{formatLkr(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-white/10 pt-2">
                <div className="flex justify-between font-saira">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-lg font-bold text-amber-400">
                    {formatLkr(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Orders Page                                                   */
/* ------------------------------------------------------------------ */

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Real-time subscription
  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Counts per status
  const counts = useMemo(() => {
    const c = { all: 0, pending: 0, processing: 0, completed: 0, cancelled: 0 };
    for (const o of orders) {
      c.all++;
      c[o.status]++;
    }
    return c;
  }, [orders]);

  // Revenue (completed orders)
  const revenue = useMemo(
    () => orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0),
    [orders],
  );

  // Filtered list
  const filtered = useMemo(() => {
    let list = orders;
    if (activeTab !== "all") {
      list = list.filter((o) => o.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.customer.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, activeTab, search]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "processing", label: "Processing", count: counts.processing },
    { key: "completed", label: "Completed", count: counts.completed },
    { key: "cancelled", label: "Cancelled", count: counts.cancelled },
  ];

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
    // The real-time listener will automatically update the UI
    // Also update the selected order view
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev));
  };

  return (
    <div className="min-h-screen p-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Orders</h1>
            <p className="text-sm text-white/70 font-saira">Track and manage customer orders</p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Total Orders</p>
          <p className="mt-1 text-xl font-bold text-white font-saira">{counts.all}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Pending</p>
          <p className="mt-1 text-xl font-bold text-amber-400 font-saira">{counts.pending}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Completed</p>
          <p className="mt-1 text-xl font-bold text-emerald-400 font-saira">{counts.completed}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Revenue</p>
          <p className="mt-1 text-xl font-bold text-white font-saira">{formatLkr(revenue)}</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-800/60 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all font-saira ${
                activeTab === tab.key
                  ? "bg-white/10 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeTab === tab.key
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-gray-700 text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-gray-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira sm:w-64"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gray-800/50 backdrop-blur-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              <p className="text-sm text-gray-400 font-saira">Loading orders...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                    Customer
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira md:table-cell">
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                    Status
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira lg:table-cell">
                    Payment
                  </th>
                  <th className="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira sm:table-cell">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700/50">
                          <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-400 font-saira">
                          {search ? "No orders match your search" : "No orders yet"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 font-saira">
                          {search
                            ? "Try a different search term"
                            : "Orders will appear here when customers make purchases"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 transition-colors hover:bg-white/[0.02] cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-amber-400 font-saira">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-white font-saira">
                            {order.customer.name}
                          </p>
                          <p className="text-xs text-gray-400 font-saira">
                            {order.customer.phone}
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 md:table-cell">
                        <div className="flex items-center">
                          {/* Stack product images */}
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              <div
                                key={i}
                                className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-gray-800 bg-gray-700"
                              >
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                                    {item.name[0]}
                                  </div>
                                )}
                              </div>
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-800 bg-gray-700 text-[10px] font-bold text-gray-300">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="ml-2 text-xs text-gray-400 font-saira">
                            {order.items.reduce((s, it) => s + it.quantity, 0)} item
                            {order.items.reduce((s, it) => s + it.quantity, 0) > 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-white font-saira">
                          {formatLkr(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="hidden px-6 py-4 lg:table-cell">
                        <PaymentBadge method={order.paymentMethod} />
                      </td>
                      <td className="hidden px-6 py-4 sm:table-cell">
                        <span className="text-xs text-gray-400 font-saira">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white font-saira"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
