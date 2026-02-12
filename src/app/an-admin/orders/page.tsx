"use client";

import { useState } from "react";

type Tab = "all" | "pending" | "processing" | "completed" | "cancelled";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: 0 },
    { key: "pending", label: "Pending", count: 0 },
    { key: "processing", label: "Processing", count: 0 },
    { key: "completed", label: "Completed", count: 0 },
    { key: "cancelled", label: "Cancelled", count: 0 },
  ];

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
          <p className="text-xs text-gray-400 font-saira">Total Orders</p>
          <p className="mt-1 text-xl font-bold text-white font-saira">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Pending</p>
          <p className="mt-1 text-xl font-bold text-amber-400 font-saira">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Completed</p>
          <p className="mt-1 text-xl font-bold text-emerald-400 font-saira">0</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Revenue</p>
          <p className="mt-1 text-xl font-bold text-white font-saira">LKR 0</p>
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
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Products
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Total
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-700/50">
                    <svg className="h-8 w-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-400 font-saira">
                    No orders yet
                  </p>
                  <p className="mt-1 text-xs text-gray-500 font-saira">
                    Orders will appear here when customers make purchases
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
