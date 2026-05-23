"use client";

import { useEffect, useState, useMemo } from "react";
import { subscribeToOrders, type Order, type PaymentMethod } from "@/lib/orders";
import { formatLkr } from "@/utils/currency";

type TimeFilter = "all" | "today" | "week" | "month";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bank_deposit: "Bank Deposit",
  payzy: "PayZy",
  advance: "Advanced Payment",
};

const PAYMENT_COLORS: Record<PaymentMethod, { bg: string; text: string; dot: string }> = {
  cod: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  bank_deposit: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  payzy: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  advance: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
};

export default function PaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      const visible = data.filter(
        (o) => o.paymentMethod !== "payzy" || o.payzyPaymentStatus === "success",
      );
      setOrders(visible);
    });
    return () => unsub();
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filtered = useMemo(() => {
    let list = orders;

    if (timeFilter === "today") list = list.filter((o) => o.createdAt >= startOfToday);
    else if (timeFilter === "week") list = list.filter((o) => o.createdAt >= startOfWeek);
    else if (timeFilter === "month") list = list.filter((o) => o.createdAt >= startOfMonth);

    if (methodFilter !== "all") list = list.filter((o) => o.paymentMethod === methodFilter);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q),
      );
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, timeFilter, methodFilter, search]);

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const successfulPayments = filtered.filter((o) => o.status !== "cancelled").length;
  const cancelledPayments = filtered.filter((o) => o.status === "cancelled").length;
  const avgOrderValue = successfulPayments > 0 ? totalRevenue / successfulPayments : 0;

  const methodBreakdown = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const o of filtered) {
      if (o.status === "cancelled") continue;
      if (!map[o.paymentMethod]) map[o.paymentMethod] = { count: 0, total: 0 };
      map[o.paymentMethod].count++;
      map[o.paymentMethod].total += o.total;
    }
    return map;
  }, [filtered]);

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: "all", label: "All Time" },
    { key: "today", label: "Today" },
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Payments</h1>
            <p className="text-sm text-white/70 font-saira">Track revenue &amp; payment activity</p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Revenue",
            value: formatLkr(totalRevenue),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            iconBg: "bg-emerald-500/20",
            iconColor: "text-emerald-400",
          },
          {
            label: "Successful Payments",
            value: String(successfulPayments),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            iconBg: "bg-blue-500/20",
            iconColor: "text-blue-400",
          },
          {
            label: "Cancelled",
            value: String(cancelledPayments),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            iconBg: "bg-red-500/20",
            iconColor: "text-red-400",
          },
          {
            label: "Avg. Order Value",
            value: formatLkr(avgOrderValue),
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            ),
            iconBg: "bg-violet-500/20",
            iconColor: "text-violet-400",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-gray-800/50 p-5 backdrop-blur-sm transition-all hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 font-saira">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white font-saira">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Payment Method Breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white font-saira mb-5">Payment Methods</h2>
          <div className="space-y-4">
            {(["cod", "bank_deposit", "payzy"] as PaymentMethod[]).map((method) => {
              const data = methodBreakdown[method] || { count: 0, total: 0 };
              const pct = successfulPayments > 0 ? (data.count / successfulPayments) * 100 : 0;
              const colors = PAYMENT_COLORS[method];
              return (
                <div key={method} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                      <span className="text-sm text-gray-300 font-saira">{PAYMENT_LABELS[method]}</span>
                    </div>
                    <span className="text-sm font-semibold text-white font-saira">{data.count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5">
                    <div
                      className={`h-2 rounded-full ${colors.dot} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 font-saira">{formatLkr(data.total)} &middot; {pct.toFixed(0)}%</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters + Transaction List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Time filter pills */}
            <div className="flex items-center gap-1 rounded-xl bg-gray-800/70 p-1 border border-white/10">
              {timeFilters.map((tf) => (
                <button
                  key={tf.key}
                  onClick={() => setTimeFilter(tf.key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-saira ${
                    timeFilter === tf.key
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Method filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | "all")}
              className="appearance-none rounded-xl border border-white/10 bg-gray-800/70 pl-3 pr-8 py-2 text-xs text-gray-300 outline-none font-saira bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
            >
              <option value="all">All Methods</option>
              <option value="cod">COD</option>
              <option value="bank_deposit">Bank Deposit</option>
              <option value="payzy">PayZy</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by order #, name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-gray-800/70 py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 font-saira"
              />
            </div>
          </div>

          {/* Transaction Table */}
          <div className="rounded-2xl border border-white/10 bg-gray-800/50 backdrop-blur-sm overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider font-saira">Order</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider font-saira">Customer</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider font-saira">Method</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider font-saira">Status</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider font-saira text-right">Amount</th>
                    <th className="px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider font-saira text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-700/50">
                            <svg className="h-7 w-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-400 font-saira">No payments found</p>
                          <p className="mt-1 text-xs text-gray-500 font-saira">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order) => {
                      const colors = PAYMENT_COLORS[order.paymentMethod];
                      const isCancelled = order.status === "cancelled";
                      return (
                        <tr key={order.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-5 py-3">
                            <p className="text-sm font-semibold text-white font-saira">{order.orderNumber}</p>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-sm text-gray-300 font-saira">{order.customer.name}</p>
                            <p className="text-xs text-gray-500 font-saira">{order.customer.email}</p>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${colors.bg} ${colors.text} font-saira`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                              {PAYMENT_LABELS[order.paymentMethod]}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium font-saira ${
                              isCancelled
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {isCancelled ? "Cancelled" : "Paid"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <p className={`text-sm font-bold font-saira ${isCancelled ? "text-gray-500 line-through" : "text-white"}`}>
                              {formatLkr(order.total)}
                            </p>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <p className="text-xs text-gray-400 font-saira">
                              {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </p>
                            <p className="text-xs text-gray-500 font-saira">
                              {order.createdAt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-white/5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-12 px-4">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-700/50">
                    <svg className="h-7 w-7 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-400 font-saira">No payments found</p>
                </div>
              ) : (
                filtered.map((order) => {
                  const colors = PAYMENT_COLORS[order.paymentMethod];
                  const isCancelled = order.status === "cancelled";
                  return (
                    <div key={order.id} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white font-saira">{order.orderNumber}</p>
                        <p className={`text-sm font-bold font-saira ${isCancelled ? "text-gray-500 line-through" : "text-emerald-400"}`}>
                          {formatLkr(order.total)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-saira">{order.customer.name}</p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text} font-saira`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                          {PAYMENT_LABELS[order.paymentMethod]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-saira">
                          {order.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                        <span className={`text-[10px] font-medium font-saira ${isCancelled ? "text-red-400" : "text-emerald-400"}`}>
                          {isCancelled ? "Cancelled" : "Paid"}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer summary */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-800/30 px-5 py-3">
              <p className="text-xs text-gray-400 font-saira">
                Showing <span className="text-white font-medium">{filtered.length}</span> transaction{filtered.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-400 font-saira">
                Total: <span className="text-emerald-400 font-bold">{formatLkr(totalRevenue)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
