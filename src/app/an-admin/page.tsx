"use client";

import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { fetchAllProducts } from "@/lib/firestore-products";
import { subscribeToOrders, type Order } from "@/lib/orders";
import { subscribeToCustomers } from "@/lib/customers";
import { formatLkr } from "@/utils/currency";
import dynamic from "next/dynamic";

const RechartsArea = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false },
);
const RechartsBar = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false },
);
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false },
);

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [revenueRange, setRevenueRange] = useState<"7d" | "30d" | "year">("7d");
  const [ordersRange, setOrdersRange] = useState<"7d" | "30d" | "year">("7d");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchAllProducts()
      .then((products) => setProductCount(products.length))
      .catch(() => setProductCount(0));

    const unsubOrders = subscribeToOrders((data) => {
      const visible = data.filter(
        (o) => o.paymentMethod !== "payzy" || o.payzyPaymentStatus === "success",
      );
      setOrders(visible);
    });

    const unsubCustomers = subscribeToCustomers((data) => {
      setCustomerCount(data.length);
    });

    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const totalOrders = orders.length;
  const ordersThisWeek = orders.filter((o) => o.createdAt >= startOfWeek).length;
  const monthlyRevenue = orders
    .filter((o) => o.status === "sent_to_courier" && o.createdAt >= startOfMonth && o.createdAt < endOfMonth)
    .reduce((sum, o) => sum + o.total, 0);
  const recentOrders = orders.slice(0, 5);

  // --- Chart data builder ---
  function buildChartData(range: "7d" | "30d" | "year") {
    if (range === "year") {
      // Jan to Dec of current year
      const months: { label: string; start: Date; end: Date }[] = [];
      for (let m = 0; m < 12; m++) {
        const s = new Date(today.getFullYear(), m, 1);
        const e = new Date(today.getFullYear(), m + 1, 1);
        months.push({ label: s.toLocaleDateString("en-US", { month: "short" }), start: s, end: e });
      }
      return months.map(({ label, start, end }) => {
        const matched = orders.filter((o) => o.createdAt >= start && o.createdAt < end && o.status !== "cancelled");
        return { name: label, revenue: matched.reduce((s, o) => s + o.total, 0), orders: matched.length };
      });
    }
    if (range === "30d") {
      // 1st to last day of current month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const buckets: { label: string; date: Date }[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(today.getFullYear(), today.getMonth(), d);
        buckets.push({ label: String(d), date: dt });
      }
      return buckets.map(({ label, date }) => {
        const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
        const matched = orders.filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd && o.status !== "cancelled");
        return { name: label, revenue: matched.reduce((s, o) => s + o.total, 0), orders: matched.length };
      });
    }
    // Mon to Sun of current week
    const monday = new Date(today);
    const dayOfWeek = monday.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(monday.getDate() - diff);
    monday.setHours(0, 0, 0, 0);
    const buckets: { label: string; date: Date }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      buckets.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), date: d });
    }
    return buckets.map(({ label, date }) => {
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
      const matched = orders.filter((o) => o.createdAt >= dayStart && o.createdAt <= dayEnd && o.status !== "cancelled");
      return { name: label, revenue: matched.reduce((s, o) => s + o.total, 0), orders: matched.length };
    });
  }

  const revenueChartData = useMemo(() => buildChartData(revenueRange), [orders, today, revenueRange]); // eslint-disable-line react-hooks/exhaustive-deps
  const ordersChartData = useMemo(() => buildChartData(ordersRange), [orders, today, ordersRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const revRangeLabel = revenueRange === "7d" ? "This Week" : revenueRange === "30d" ? "This Month" : "This Year";
  const ordRangeLabel = ordersRange === "7d" ? "This Week" : ordersRange === "30d" ? "This Month" : "This Year";

  const ordersByMethod = useMemo(() => {
    const nonCancelled = orders.filter((o) => o.status !== "cancelled");
    const cod = nonCancelled.filter((o) => o.paymentMethod === "cod").length;
    const bank = nonCancelled.filter((o) => o.paymentMethod === "bank_deposit").length;
    const payzy = nonCancelled.filter((o) => o.paymentMethod === "payzy").length;
    return [
      { name: "COD", value: cod, color: "#f59e0b" },
      { name: "Bank", value: bank, color: "#3b82f6" },
      { name: "PayZy", value: payzy, color: "#06b6d4" },
    ];
  }, [orders]);

  const statusBreakdown = useMemo(() => {
    const confirmed = orders.filter((o) => o.status === "confirmed" || o.status === "pending" || o.status === "processing").length;
    const shipped = orders.filter((o) => o.status === "sent_to_courier").length;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return { confirmed, shipped, cancelled };
  }, [orders]);

  const statCards = [
    {
      label: "Total Products",
      value: String(productCount),
      sub: "In catalog",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      iconBg: "bg-amber-500/20",
      iconColor: "text-amber-400",
    },
    {
      label: "Total Orders",
      value: String(totalOrders),
      sub: `+ ${ordersThisWeek} this week`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },
    {
      label: "Monthly Revenue",
      value: formatLkr(monthlyRevenue),
      sub: "vs last month",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "bg-violet-500/20",
      iconColor: "text-violet-400",
    },
    {
      label: "Customers",
      value: String(customerCount),
      sub: "Registered",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: "bg-rose-500/20",
      iconColor: "text-rose-400",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Top Header Card - Gradient Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-rose-500 to-purple-600 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black backdrop-blur-sm">
            <Image
              src="/logo-2.png"
              alt="Aroma Notes"
              width={32}
              height={32}
              className="rounded-md"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Aroma Notes</h1>
            <p className="text-sm text-white/70 font-saira">Business Overview</p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Stat Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/10 bg-gray-800/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-gray-800/70"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400 font-saira">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}>
                <span className={card.iconColor}>{card.icon}</span>
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-white font-saira">{card.value}</p>
            <p className="mt-1 text-xs text-gray-500 font-saira">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-semibold text-white font-saira">Revenue ({revRangeLabel})</h2>
              <p className="text-xs text-gray-400 font-saira mt-0.5">{revenueRange === "year" ? "Monthly" : "Daily"} revenue trend</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
              {([["7d", "Week"], ["30d", "Month"], ["year", "Year"]] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setRevenueRange(key)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-saira ${
                    revenueRange === key
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto -mx-2 px-2">
            <div className="h-[240px]" style={{ minWidth: revenueRange === "30d" ? 800 : 500 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RechartsArea data={revenueChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Saira" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Saira" }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(0)}k` : String(v)} />
                  <Tooltip
                    contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", fontFamily: "Saira" }}
                    labelStyle={{ color: "#9ca3af" }}
                    itemStyle={{ color: "#10b981" }}
                    formatter={(value) => [formatLkr(Number(value ?? 0)), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" />
                </RechartsArea>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Status + Payment Method Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white font-saira mb-5">Order Breakdown</h2>

          {/* Status rings */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 font-saira mb-3 uppercase tracking-wider">By Status</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Confirmed", value: statusBreakdown.confirmed, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Shipped", value: statusBreakdown.shipped, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                { label: "Cancelled", value: statusBreakdown.cancelled, color: "text-red-400", bg: "bg-red-500/10" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl ${s.bg} p-3 text-center`}>
                  <p className={`text-lg font-bold ${s.color} font-saira`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 font-saira">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method bars */}
          <div>
            <p className="text-xs text-gray-400 font-saira mb-3 uppercase tracking-wider">By Payment</p>
            <div className="space-y-3">
              {ordersByMethod.map((m) => {
                const total = ordersByMethod.reduce((s, x) => s + x.value, 0);
                const pct = total > 0 ? (m.value / total) * 100 : 0;
                return (
                  <div key={m.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: m.color }} />
                        <span className="text-xs text-gray-300 font-saira">{m.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-white font-saira">{m.value}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5">
                      <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Per Day Bar Chart */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white font-saira">Orders ({ordRangeLabel})</h2>
            <p className="text-xs text-gray-400 font-saira mt-0.5">{ordersRange === "year" ? "Monthly" : "Daily"} order volume</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10">
            {([["7d", "Week"], ["30d", "Month"], ["year", "Year"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setOrdersRange(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all font-saira ${
                  ordersRange === key
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="h-[200px]" style={{ minWidth: ordersRange === "30d" ? 800 : 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBar data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Saira" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "Saira" }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "12px", fontFamily: "Saira" }}
                  labelStyle={{ color: "#9ca3af" }}
                  itemStyle={{ color: "#f59e0b" }}
                  formatter={(value) => [String(value ?? 0), "Orders"]}
                />
                <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </RechartsBar>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Orders */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white font-saira">Recent Orders</h2>
                <p className="text-xs text-gray-400 font-saira">{formattedDate}</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 font-saira">
              {recentOrders.length} orders
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center py-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700/50">
                <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-400 font-saira">No orders yet</p>
              <p className="mt-1 text-xs text-gray-500 font-saira">
                Orders will appear here as they come in
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white font-saira">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 font-saira">{order.customer.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-400 font-saira">{formatLkr(order.total)}</p>
                    <p className="text-xs text-gray-500 font-saira">{order.status.replaceAll("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Info Card */}
        <div className="rounded-2xl border border-white/10 bg-gray-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-base font-semibold text-white font-saira mb-4">Quick Info</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-saira">Logged in as</p>
                <p className="text-sm font-medium text-white font-saira truncate">
                  {user?.displayName || "Admin"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-saira">Email</p>
                <p className="text-sm font-medium text-white font-saira truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
                <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-saira">Role</p>
                <p className="text-sm font-medium text-white font-saira">Super Admin</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/20">
                <svg className="h-4 w-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-saira">Store</p>
                <p className="text-sm font-medium text-white font-saira">aromanotes.lk</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
