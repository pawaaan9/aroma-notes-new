"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { subscribeToCustomers, type CustomerSummary } from "@/lib/customers";
import { formatLkr } from "@/utils/currency";

function ordersSearchQuery(c: CustomerSummary): string {
  const e = c.email.trim();
  if (e) return e;
  const p = c.phone.trim().replace(/\s+/g, "");
  if (p) return p;
  return c.name.trim();
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [detailCustomer, setDetailCustomer] = useState<CustomerSummary | null>(null);

  useEffect(() => {
    const unsub = subscribeToCustomers((data) => setCustomers(data));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!detailCustomer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailCustomer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detailCustomer]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);
    const totalOrders = customers.reduce((s, c) => s + c.totalOrders, 0);
    const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const now = new Date();
    const newThisMonth = customers.filter((c) =>
      c.lastOrderAt.getMonth() === now.getMonth() &&
      c.lastOrderAt.getFullYear() === now.getFullYear(),
    ).length;
    const returning = customers.filter((c) => c.totalOrders > 1).length;
    return { totalCustomers, newThisMonth, returning, avgOrder };
  }, [customers]);

  const formatDate = (date: Date): string =>
    new Intl.DateTimeFormat("en-LK", { year: "numeric", month: "short", day: "numeric" }).format(date);

  return (
    <div className="min-h-screen p-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Customers</h1>
            <p className="text-sm text-white/70 font-saira">View and manage your customer base</p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -left-8 top-8 h-24 w-24 rounded-full bg-white/5" />
      </div>

      {/* Action Button */}
      <div className="mt-4 flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:bg-white/10 hover:text-white font-saira">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-saira">Total Customers</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
              <svg className="h-4 w-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-white font-saira">{stats.totalCustomers}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-saira">New This Month</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-400 font-saira">{stats.newThisMonth}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-saira">Returning</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
              <svg className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-violet-400 font-saira">{stats.returning}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-saira">Avg. Order Value</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20">
              <svg className="h-4 w-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xl font-bold text-white font-saira">{formatLkr(stats.avgOrder)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-gray-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira sm:max-w-sm"
          />
        </div>
      </div>

      {/* Customers list: cards on small screens, table on md+ */}
      {filtered.length === 0 ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-gray-800/50 px-6 py-16 text-center backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700/50">
              <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400 font-saira">
              {search ? "No customers match your search" : "No customers yet"}
            </p>
            <p className="mt-1 text-xs text-gray-500 font-saira">
              {search ? "Try a different search term" : "Customer data will appear here as orders come in"}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3 md:hidden">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-white/10 bg-gray-800/50 p-4 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white font-saira">{c.name}</p>
                    <p className="truncate text-xs text-gray-400 font-saira">{c.email || "—"}</p>
                    <p className="mt-1 text-sm text-gray-300 font-saira">{c.phone || "—"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailCustomer(c)}
                    className="shrink-0 rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 font-saira"
                  >
                    View
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 font-saira">Orders</p>
                    <p className="font-semibold text-white font-saira">{c.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 font-saira">Spent</p>
                    <p className="font-semibold text-emerald-400 font-saira">{formatLkr(c.totalSpent)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500 font-saira">Last order</p>
                    <p className="text-xs text-gray-300 font-saira">
                      {c.lastOrderNumber ? `${c.lastOrderNumber} · ${formatDate(c.lastOrderAt)}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden md:block">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gray-800/50 backdrop-blur-sm [-webkit-overflow-scrolling:touch]">
              <table className="w-full min-w-[56rem] table-fixed">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="w-[22%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-6 lg:py-4 font-saira">
                          Customer
                        </th>
                        <th className="w-[14%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-6 lg:py-4 font-saira">
                          Phone
                        </th>
                        <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-6 lg:py-4 font-saira">
                          Orders
                        </th>
                        <th className="w-[12%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-6 lg:py-4 font-saira">
                          Spent
                        </th>
                        <th className="w-[30%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-6 lg:py-4 font-saira">
                          Last order
                        </th>
                        <th className="w-[12%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-6 lg:py-4 font-saira">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((c) => (
                        <tr key={c.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                          <td className="px-4 py-3 align-top lg:px-6 lg:py-4">
                            <p className="truncate text-sm font-semibold text-white font-saira">{c.name}</p>
                            <p className="truncate text-xs text-gray-400 font-saira">{c.email || "—"}</p>
                          </td>
                          <td className="px-4 py-3 align-top text-sm text-gray-300 lg:px-6 lg:py-4 font-saira">
                            <span className="line-clamp-2 break-all">{c.phone || "—"}</span>
                          </td>
                          <td className="px-4 py-3 align-top text-sm font-semibold text-white lg:px-6 lg:py-4 font-saira">
                            {c.totalOrders}
                          </td>
                          <td className="px-4 py-3 align-top text-sm font-semibold text-emerald-400 lg:px-6 lg:py-4 font-saira">
                            {formatLkr(c.totalSpent)}
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-400 lg:px-6 lg:py-4 font-saira">
                            <span className="line-clamp-2">
                              {c.lastOrderNumber ? `${c.lastOrderNumber} · ${formatDate(c.lastOrderAt)}` : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right align-top lg:px-6 lg:py-4">
                            <button
                              type="button"
                              onClick={() => setDetailCustomer(c)}
                              className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-200 transition-colors hover:bg-amber-500/30 font-saira"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
          </div>
        </>
      )}

      {detailCustomer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-detail-title"
          onClick={() => setDetailCustomer(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id="customer-detail-title" className="text-lg font-bold text-white font-saira">
                {detailCustomer.name}
              </h2>
              <button
                type="button"
                onClick={() => setDetailCustomer(null)}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">Email</dt>
                <dd className="mt-0.5 break-all text-gray-200 font-saira">{detailCustomer.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">Phone</dt>
                <dd className="mt-0.5 text-gray-200 font-saira">{detailCustomer.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">City</dt>
                <dd className="mt-0.5 text-gray-200 font-saira">{detailCustomer.city || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">Address</dt>
                <dd className="mt-0.5 text-gray-200 font-saira">{detailCustomer.address || "—"}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">Total orders</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-white font-saira">{detailCustomer.totalOrders}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">Total spent</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-emerald-400 font-saira">
                    {formatLkr(detailCustomer.totalSpent)}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500 font-saira">Last order</dt>
                <dd className="mt-0.5 text-gray-200 font-saira">
                  {detailCustomer.lastOrderNumber
                    ? `${detailCustomer.lastOrderNumber} · ${formatDate(detailCustomer.lastOrderAt)}`
                    : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/an-admin/orders?q=${encodeURIComponent(ordersSearchQuery(detailCustomer))}`}
                onClick={() => setDetailCustomer(null)}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
              >
                View orders
              </Link>
              <button
                type="button"
                onClick={() => setDetailCustomer(null)}
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10 font-saira"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
