"use client";

import { useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  subscribeToOrders,
  type Order,
  type PaymentMethod,
} from "@/lib/orders";
import { formatLkr } from "@/utils/currency";

type PaidFilter = "all" | PaymentMethod;

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  bank_deposit: "Bank Deposit",
  payzy: "Payzy",
  advance: "Advanced Payment",
};

const PAYMENT_COLORS: Record<PaymentMethod, { bg: string; text: string }> = {
  cod: { bg: "bg-amber-500/15", text: "text-amber-200" },
  bank_deposit: { bg: "bg-blue-500/15", text: "text-blue-200" },
  payzy: { bg: "bg-fuchsia-500/15", text: "text-fuchsia-200" },
  advance: { bg: "bg-emerald-500/15", text: "text-emerald-200" },
};

function isPaidOrder(o: Order): boolean {
  if (o.status === "cancelled") return false;
  if (o.paymentMethod === "payzy") return o.payzyPaymentStatus === "success";
  return true;
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function invoiceNumberForOrder(o: Order): string {
  const year = o.createdAt.getFullYear();
  const tail = (o.orderNumber || o.id)
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  return `AN-${year}-${tail || "000000"}`;
}

async function fetchOrderPdfBlobUrl(order: Order): Promise<string> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Not signed in");

  const res = await fetch("/api/invoice/order/render", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to generate PDF");
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export default function FullPaymentsInvoicePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<PaidFilter>("all");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewFileName, setPreviewFileName] = useState<string>("invoice.pdf");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data.filter(isPaidOrder));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const closePreview = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewLoading(false);
  };

  useEffect(() => {
    if (!previewUrl && !previewLoading) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePreview();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewUrl, previewLoading]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "all") list = list.filter((o) => o.paymentMethod === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q) ||
          o.customer.phone.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")),
      );
    }
    return list;
  }, [orders, search, filter]);

  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalAmount = orders.reduce((s, o) => s + o.total, 0);
    const thisMonth = orders.filter((o) => {
      const now = new Date();
      return (
        o.createdAt.getMonth() === now.getMonth() &&
        o.createdAt.getFullYear() === now.getFullYear()
      );
    });
    const monthAmount = thisMonth.reduce((s, o) => s + o.total, 0);
    return {
      totalCount,
      totalAmount,
      monthCount: thisMonth.length,
      monthAmount,
    };
  }, [orders]);

  const openPreview = async (o: Order) => {
    setPreviewTitle(`${invoiceNumberForOrder(o)} · ${o.customer.name}`);
    setPreviewFileName(`${invoiceNumberForOrder(o)}.pdf`);
    setPreviewLoading(true);
    setPreviewUrl(null);
    setError("");
    try {
      const url = await fetchOrderPdfBlobUrl(o);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoice preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadInvoice = async (o: Order) => {
    setError("");
    try {
      const url = await fetchOrderPdfBlobUrl(o);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNumberForOrder(o)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Failed to download invoice PDF.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v6h6M8 13h8M8 17h8M8 9h2.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Full payments · Invoices</h1>
            <p className="text-sm text-white/80 font-saira">
              Download and resend invoices from orders that have been fully paid.
            </p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Total invoices</p>
          <p className="mt-2 text-2xl font-bold text-white font-saira">{stats.totalCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Total billed</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400 font-saira">{formatLkr(stats.totalAmount)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">This month</p>
          <p className="mt-2 text-2xl font-bold text-white font-saira">{stats.monthCount}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gray-800/50 p-4">
          <p className="text-xs text-gray-400 font-saira">Month revenue</p>
          <p className="mt-2 text-2xl font-bold text-amber-400 font-saira">{formatLkr(stats.monthAmount)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "cod", "bank_deposit", "payzy"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors font-saira ${
                filter === key
                  ? "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40"
                  : "bg-gray-800/60 text-gray-300 hover:bg-white/10"
              }`}
            >
              {key === "all" ? "All payments" : PAYMENT_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order, name, email or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-gray-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira sm:w-72"
          />
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-300 font-saira">{error}</p>
      ) : null}

      {loading ? (
        <div className="mt-10 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-gray-800/50 px-6 py-16 text-center">
          <p className="text-sm font-medium text-gray-400 font-saira">
            {search ? "No invoices match your search" : "No paid invoices yet"}
          </p>
          <p className="mt-1 text-xs text-gray-500 font-saira">
            {search
              ? "Try a different search or filter."
              : "Once orders are paid (COD, bank deposit or Payzy success) they appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3 md:hidden">
            {filtered.map((o) => (
              <div key={o.id} className="rounded-2xl border border-white/10 bg-gray-800/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-amber-300 font-saira">
                      {invoiceNumberForOrder(o)}
                    </p>
                    <p className="text-xs text-gray-400 font-saira">
                      Order {o.orderNumber} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold font-saira ${
                      PAYMENT_COLORS[o.paymentMethod].bg
                    } ${PAYMENT_COLORS[o.paymentMethod].text}`}
                  >
                    {PAYMENT_LABELS[o.paymentMethod]}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-saira">Customer</p>
                    <p className="truncate font-semibold text-white font-saira">{o.customer.name}</p>
                    <p className="truncate text-xs text-gray-400 font-saira">{o.customer.email || o.customer.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide text-gray-500 font-saira">Total</p>
                    <p className="font-bold text-emerald-300 font-saira">{formatLkr(o.total)}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => void openPreview(o)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 font-saira"
                  >
                    View PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadInvoice(o)}
                    className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-center text-xs font-bold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 hidden md:block">
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-gray-800/50 backdrop-blur-sm">
              <table className="w-full min-w-[60rem] table-fixed">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="w-[18%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                      Invoice
                    </th>
                    <th className="w-[22%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                      Customer
                    </th>
                    <th className="w-[14%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                      Payment
                    </th>
                    <th className="w-[12%] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                      Date
                    </th>
                    <th className="w-[12%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                      Total
                    </th>
                    <th className="w-[22%] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400 font-saira">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 align-top">
                        <p className="text-sm font-bold text-amber-300 font-saira">{invoiceNumberForOrder(o)}</p>
                        <p className="text-xs text-gray-400 font-saira">Order {o.orderNumber}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="truncate text-sm font-semibold text-white font-saira">{o.customer.name}</p>
                        <p className="truncate text-xs text-gray-400 font-saira">
                          {o.customer.email || o.customer.phone}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold font-saira ${
                            PAYMENT_COLORS[o.paymentMethod].bg
                          } ${PAYMENT_COLORS[o.paymentMethod].text}`}
                        >
                          {PAYMENT_LABELS[o.paymentMethod]}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-gray-400 font-saira">
                        {formatDate(o.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right align-top text-sm font-bold text-emerald-300 font-saira">
                        {formatLkr(o.total)}
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => void openPreview(o)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 font-saira"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => void downloadInvoice(o)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
                          >
                            Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {(previewUrl || previewLoading) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closePreview}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-gray-900/95 px-4 py-3">
              <p className="truncate text-sm font-semibold text-white font-saira">{previewTitle}</p>
              <div className="flex items-center gap-2">
                {previewUrl ? (
                  <a
                    href={previewUrl}
                    download={previewFileName}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
                  >
                    Download
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={closePreview}
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {previewLoading ? (
              <div className="flex flex-1 items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
              </div>
            ) : (
              <iframe src={previewUrl ?? undefined} title="Invoice preview" className="flex-1 bg-white" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
