"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { fetchAllProducts } from "@/lib/firestore-products";
import type { Product } from "@/types/product";
import {
  subscribeToAdvancedInvoices,
  createAdvancedInvoice,
  markAdvancedInvoiceSent,
  type AdvancedInvoice,
} from "@/lib/advanced-invoices";
import { formatLkr } from "@/utils/currency";
import { subscribeToSettings } from "@/lib/settings";
import { createOrder } from "@/lib/orders";
import {
  type CatalogSize,
  formatSizeLabel,
  retailPriceForVariant,
  variantForSize,
} from "@/lib/product-variants";

type DraftItem = {
  key: string;
  productId: string;
  brand: string;
  name: string;
  note: string;
  size: string;
  sizeKey: CatalogSize;
  quantity: number;
  retailPrice: number;
};

function newKey(): string {
  return Math.random().toString(36).slice(2, 9);
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-LK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

async function fetchInvoicePdfBlobUrl(inv: AdvancedInvoice): Promise<string> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Not signed in");

  const res = await fetch("/api/invoice/advanced/render", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invoice: inv }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || "Failed to generate PDF");
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

function buildInvoicePayload(
  validItems: DraftItem[],
  customer: AdvancedInvoice["customer"],
  totals: { retailSubtotal: number; deliveryFee: number; orderTotal: number },
  advanceAmount: number,
  notes: string,
  id: string,
  invoiceNumber: string,
  createdBy: string,
): AdvancedInvoice {
  return {
    id,
    invoiceNumber,
    status: "draft",
    customer,
    items: validItems.map((it) => ({
      productId: it.productId,
      brand: it.brand,
      name: it.name,
      note: it.note,
      size: it.size,
      quantity: it.quantity,
      retailPrice: it.retailPrice,
    })),
    subtotal: totals.retailSubtotal,
    retailSubtotal: totals.retailSubtotal,
    discount: 0,
    deliveryFee: totals.deliveryFee,
    total: totals.orderTotal,
    advanceAmount,
    notes,
    emailedTo: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy,
  };
}

const STATUS_LABEL: Record<AdvancedInvoice["status"], string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
};

const STATUS_COLOR: Record<AdvancedInvoice["status"], string> = {
  draft: "bg-gray-500/15 text-gray-300",
  sent: "bg-blue-500/15 text-blue-200",
  paid: "bg-emerald-500/15 text-emerald-200",
};

export default function AdvancedPaymentsInvoicePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [items, setItems] = useState<DraftItem[]>([]);
  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState<number | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const [invoices, setInvoices] = useState<AdvancedInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const [emailTarget, setEmailTarget] = useState<AdvancedInvoice | null>(null);
  const [emailTo, setEmailTo] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Manual / custom item modal (for special-order items not in catalog).
  const [customOpen, setCustomOpen] = useState(false);
  const [customForm, setCustomForm] = useState({
    brand: "",
    name: "",
    size: "100 ml",
    retailPrice: "",
    quantity: "1",
    note: "Special order · Imported on request",
  });
  const [customError, setCustomError] = useState("");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewFileName, setPreviewFileName] = useState<string>("invoice.pdf");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAllProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsub = subscribeToSettings((s) => setDeliveryFeeConfig(s.deliveryFee));
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.deliveryFee === "number") {
          setDeliveryFeeConfig(data.deliveryFee);
        }
      })
      .catch(() => {});
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToAdvancedInvoices((list) => {
      setInvoices(list);
      setInvoicesLoading(false);
    });
    return () => unsub();
  }, []);

  const closePreview = () => {
    if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewLoading(false);
  };

  useEffect(() => {
    if (!previewUrl && !emailTarget && !pickerOpen && !customOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      closePreview();
      setEmailTarget(null);
      setPickerOpen(false);
      setCustomOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewUrl, emailTarget, pickerOpen, customOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q),
    );
  }, [products, productSearch]);

  const totals = useMemo(() => {
    const retailSubtotal = items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.retailPrice) || 0),
      0,
    );
    const deliveryFee = retailSubtotal > 0 ? (deliveryFeeConfig ?? 0) : 0;
    const orderTotal = retailSubtotal + deliveryFee;
    const advance = Math.max(0, Number(advanceAmount) || 0);
    const balanceDue = Math.max(0, orderTotal - advance);
    return { retailSubtotal, deliveryFee, orderTotal, advance, balanceDue };
  }, [items, deliveryFeeConfig, advanceAmount]);

  const removeItem = (key: string) =>
    setItems((arr) => arr.filter((it) => it.key !== key));
  const updateItem = (key: string, patch: Partial<DraftItem>) =>
    setItems((arr) => arr.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const resetCustomForm = () => {
    setCustomForm({
      brand: "",
      name: "",
      size: "100 ml",
      retailPrice: "",
      quantity: "1",
      note: "Special order · Imported on request",
    });
    setCustomError("");
  };

  const openCustomModal = () => {
    resetCustomForm();
    setCustomOpen(true);
  };

  const submitCustomItem = () => {
    const name = customForm.name.trim();
    const size = customForm.size.trim();
    const brand = customForm.brand.trim();
    const note = customForm.note.trim();
    const price = Math.max(0, Number(customForm.retailPrice) || 0);
    const qty = Math.max(1, Number(customForm.quantity) || 1);

    if (!name) {
      setCustomError("Product name is required.");
      return;
    }
    if (!size) {
      setCustomError("Select a size.");
      return;
    }
    if (price <= 0) {
      setCustomError("Enter a unit price (greater than 0).");
      return;
    }

    const sizeKey: CatalogSize = size === "10 ml" ? "10ml" : "100ml";
    const item: DraftItem = {
      key: newKey(),
      productId: "",
      brand,
      name,
      note,
      size,
      sizeKey,
      quantity: qty,
      retailPrice: price,
    };
    setItems((arr) => [...arr, item]);
    setCustomOpen(false);
    resetCustomForm();
  };

  const addProductAsItem = (product: Product, sizeKey: CatalogSize) => {
    const variant = variantForSize(product, sizeKey);
    if (!variant) return;

    const item: DraftItem = {
      key: newKey(),
      productId: product._id,
      brand: product.brand ?? "",
      name: product.name,
      note: "Exclusive Import · Yusuf Bhai Collection",
      size: variant.size ?? formatSizeLabel(sizeKey),
      sizeKey,
      quantity: 1,
      retailPrice: retailPriceForVariant(variant),
    };
    setItems((arr) => [...arr, item]);
  };

  const resetForm = () => {
    setCustomer({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "" });
    setItems([]);
    setAdvanceAmount(0);
    setNotes("");
    setError("");
  };

  const handleCreate = async (then?: "preview" | "email") => {
    setError("");
    setFeedback("");
    if (!customer.name.trim()) {
      setError("Customer name is required.");
      return;
    }
    const validItems = items.filter(
      (it) => it.name.trim() && it.quantity > 0 && it.retailPrice > 0,
    );
    if (validItems.length === 0) {
      setError("Add at least one product — from your catalog or as a custom item.");
      return;
    }
    const missingAdvance = !advanceAmount || advanceAmount <= 0;
    if (missingAdvance) {
      setError("Enter the advance payment amount for this invoice.");
      return;
    }
    if (advanceAmount > totals.orderTotal) {
      setError("Advance amount cannot exceed the order total.");
      return;
    }

    setCreating(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setError("Your session has expired. Please sign in again.");
        return;
      }

      const { id, invoiceNumber } = await createAdvancedInvoice({
        customer,
        items: validItems.map((it) => ({
          productId: it.productId,
          brand: it.brand,
          name: it.name,
          note: it.note,
          size: it.size,
          quantity: it.quantity,
          retailPrice: it.retailPrice,
        })),
        retailSubtotal: totals.retailSubtotal,
        deliveryFee: totals.deliveryFee,
        total: totals.orderTotal,
        advanceAmount,
        notes,
        createdBy: uid,
      });

      try {
        await createOrder({
          items: validItems.map((it) => ({
            productId: it.productId,
            name: it.name,
            brand: it.brand || null,
            size: it.size || null,
            price: it.retailPrice,
            quantity: it.quantity,
          })),
          subtotal: totals.retailSubtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.orderTotal,
          paymentMethod: "advance",
          advanceAmount,
          advanceInvoiceId: id,
          advanceInvoiceNumber: invoiceNumber,
          customer: {
            name: customer.name,
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
            city: customer.city || "",
            ...(customer.state ? { state: customer.state } : {}),
            ...(customer.zip ? { zip: customer.zip } : {}),
            ...(notes?.trim() ? { notes: notes.trim() } : {}),
          },
        });
      } catch (orderErr) {
        console.error("[AdvancedPayments] Failed to mirror order:", orderErr);
      }

      setFeedback(`Invoice ${invoiceNumber} created.`);
      const created = buildInvoicePayload(
        validItems,
        customer,
        totals,
        advanceAmount,
        notes,
        id,
        invoiceNumber,
        uid,
      );

      if (then === "preview") {
        await openPreview(created);
      } else if (then === "email") {
        openEmailModal(created);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error && err.message.includes("permission")
          ? "Could not save the invoice. Check Firestore rules for advanced-invoices."
          : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const openPreview = async (inv: AdvancedInvoice) => {
    setPreviewTitle(`${inv.invoiceNumber} · ${inv.customer.name}`);
    setPreviewFileName(`${inv.invoiceNumber}.pdf`);
    setPreviewLoading(true);
    setPreviewUrl(null);
    try {
      const url = await fetchInvoicePdfBlobUrl(inv);
      setPreviewUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to load invoice preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadInvoice = async (inv: AdvancedInvoice) => {
    try {
      const url = await fetchInvoicePdfBlobUrl(inv);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError("Failed to download invoice PDF.");
    }
  };

  const openEmailModal = (inv: AdvancedInvoice) => {
    setEmailTarget(inv);
    setEmailTo(inv.customer.email || "");
    setEmailMessage("");
    setEmailError("");
  };

  const sendEmail = async () => {
    if (!emailTarget) return;
    if (!emailTo.trim()) {
      setEmailError("Enter a recipient email address.");
      return;
    }
    setEmailSending(true);
    setEmailError("");
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        setEmailError("Your session has expired. Please sign in again.");
        return;
      }
      const res = await fetch(`/api/invoice/advanced/${emailTarget.id}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          email: emailTo.trim(),
          message: emailMessage,
          invoice: emailTarget,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Failed to send email.");
        return;
      }
      await markAdvancedInvoiceSent(emailTarget.id, data.sentTo);
      setFeedback(`Invoice sent to ${data.sentTo}`);
      setEmailTarget(null);
    } catch (err) {
      console.error(err);
      setEmailError("Could not send the email.");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 p-6 shadow-xl">
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-saira">Advanced payments</h1>
            <p className="text-sm text-white/85 font-saira">
              Select products from your catalog (10 ml or 100 ml), set one advance amount for the invoice, then email or download the PDF.
            </p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Builder */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <section className="rounded-2xl border border-white/10 bg-gray-800/50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 font-saira">
              Customer
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([
                ["name", "Customer name *", "John Doe"],
                ["email", "Email", "name@example.com"],
                ["phone", "Phone", "077 000 0000"],
                ["city", "City", "Colombo"],
                ["state", "Province", "Western"],
                ["zip", "Postal code", "10000"],
              ] as const).map(([field, label, placeholder]) => (
                <label key={field} className="block">
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                    {label}
                  </span>
                  <input
                    type="text"
                    value={customer[field]}
                    onChange={(e) =>
                      setCustomer((c) => ({ ...c, [field]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                  />
                </label>
              ))}
              <label className="block sm:col-span-2">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Address
                </span>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                  placeholder="House no., street"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 font-saira"
                />
              </label>
            </div>
          </section>

          {/* Items */}
          <section className="rounded-2xl border border-white/10 bg-gray-800/50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 font-saira">
                  Products
                </h2>
                <p className="mt-0.5 text-xs text-gray-400 font-saira">
                  Pick from your catalog, or add a custom item for special-order
                  imports.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openCustomModal}
                  className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-200 transition-colors hover:bg-amber-500/20 font-saira"
                >
                  + Custom item
                </button>
                <button
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
                >
                  + Add product
                </button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-gray-900/30 px-4 py-10 text-center">
                <p className="text-sm text-gray-400 font-saira">No products added yet.</p>
                <p className="mt-1 text-xs text-gray-500 font-saira">
                  Use &ldquo;Add product&rdquo; for catalog items, or &ldquo;Custom
                  item&rdquo; for special-order imports.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {items.map((it, index) => {
                  const isCustom = !it.productId;
                  return (
                  <div
                    key={it.key}
                    className="rounded-xl border border-white/10 bg-gray-900/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 font-saira">
                          Item {index + 1}
                          {it.brand ? ` · ${it.brand}` : ""}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-white font-saira">{it.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-200 font-saira">
                            {it.size}
                          </span>
                          {isCustom ? (
                            <span className="inline-flex rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-300 font-saira">
                              Custom
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.key)}
                        className="shrink-0 rounded-lg border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/20 font-saira"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="block">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 font-saira">
                          Quantity
                        </span>
                        <div className="mt-1 flex overflow-hidden rounded-xl border border-white/10 bg-gray-900/60">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            disabled={it.quantity <= 1}
                            onClick={() =>
                              updateItem(it.key, {
                                quantity: Math.max(1, it.quantity - 1),
                              })
                            }
                            className="group flex w-11 shrink-0 items-center justify-center border-r border-white/10 bg-amber-500/5 transition-all hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-amber-500/5"
                          >
                            <svg
                              className="h-4 w-4 text-amber-300 transition-transform group-hover:-translate-x-0.5 group-hover:text-amber-200 group-disabled:translate-x-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              aria-hidden
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={it.quantity}
                            onChange={(e) =>
                              updateItem(it.key, {
                                quantity: Math.max(1, Number(e.target.value) || 1),
                              })
                            }
                            className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-center text-sm font-semibold text-white outline-none font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              updateItem(it.key, {
                                quantity: it.quantity + 1,
                              })
                            }
                            className="group flex w-11 shrink-0 items-center justify-center border-l border-white/10 bg-amber-500/5 transition-all hover:bg-amber-500/15"
                          >
                            <svg
                              className="h-4 w-4 text-amber-300 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-200"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth={2.5}
                              aria-hidden
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <label className="block">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 font-saira">
                          Unit price
                        </span>
                        {isCustom ? (
                          <input
                            type="number"
                            min={0}
                            value={it.retailPrice || ""}
                            onChange={(e) =>
                              updateItem(it.key, {
                                retailPrice: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            placeholder="0"
                            className="mt-1 w-full rounded-lg border border-amber-500/30 bg-gray-900/60 px-2.5 py-2 text-sm font-semibold text-amber-100 outline-none focus:border-amber-500/60 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <div className="mt-1 rounded-lg border border-white/10 bg-gray-800/80 px-2.5 py-2 text-sm text-gray-300 font-saira">
                            {formatLkr(it.retailPrice)}
                          </div>
                        )}
                      </label>
                      <div className="flex flex-col justify-end">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500 font-saira">
                          Line total
                        </span>
                        <p className="mt-1 text-base font-bold text-emerald-300 font-saira">
                          {formatLkr(it.quantity * it.retailPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="rounded-2xl border border-white/10 bg-gray-800/50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 font-saira">
              Invoice notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optional notes (payment terms, special instructions, etc.)"
              className="mt-3 w-full rounded-lg border border-white/10 bg-gray-900/60 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
            />
          </section>
        </div>

        {/* Summary */}
        <aside className="space-y-4 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-white/10 bg-gray-800/70 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 font-saira">
              Summary
            </h2>
            <div className="mt-4 space-y-2 text-sm font-saira">
              <div className="flex justify-between text-gray-400">
                <span>Retail subtotal</span>
                <span className="text-gray-300">{formatLkr(totals.retailSubtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Delivery fee</span>
                <span className="text-gray-300">
                  {deliveryFeeConfig === null
                    ? "…"
                    : deliveryFeeConfig === 0
                      ? "Free"
                      : formatLkr(deliveryFeeConfig)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-gray-200">
                <span>Order total</span>
                <span>{formatLkr(totals.orderTotal)}</span>
              </div>
              <div className="border-t border-white/10 pt-3">
                <label htmlFor="adv-amount" className="block text-sm font-semibold text-amber-200 font-saira">
                  Advance payment *
                </label>
                <input
                  id="adv-amount"
                  type="number"
                  min={0}
                  value={advanceAmount || ""}
                  onChange={(e) => setAdvanceAmount(Math.max(0, Number(e.target.value) || 0))}
                  placeholder="Enter amount"
                  className="mt-2 w-full rounded-xl border border-amber-500/40 bg-gray-900/60 px-4 py-3 text-lg font-semibold text-amber-100 outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              {totals.balanceDue > 0 ? (
                <div className="flex justify-between text-gray-400">
                  <span>Balance remaining</span>
                  <span>{formatLkr(totals.balanceDue)}</span>
                </div>
              ) : null}
              <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-base font-bold text-white">
                <span>Advance due now</span>
                <span className="text-amber-300">{formatLkr(totals.advance)}</span>
              </div>
            </div>

            {error ? (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 font-saira">{error}</p>
            ) : null}
            {feedback ? (
              <p className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 font-saira">{feedback}</p>
            ) : null}

            <div className="mt-4 grid gap-2">
              <button
                type="button"
                disabled={creating}
                onClick={() => handleCreate("email")}
                className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-amber-400 disabled:opacity-60 font-saira"
              >
                {creating ? "Saving..." : "Save & Email"}
              </button>
              <button
                type="button"
                disabled={creating}
                onClick={() => handleCreate("preview")}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 disabled:opacity-60 font-saira"
              >
                Save & Preview PDF
              </button>
              <button
                type="button"
                disabled={creating}
                onClick={() => handleCreate()}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/10 disabled:opacity-60 font-saira"
              >
                Save only
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Saved invoices */}
      <section className="mt-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-white font-saira">Saved advanced invoices</h2>
          <span className="text-xs text-gray-400 font-saira">{invoices.length} total</span>
        </div>

        {invoicesLoading ? (
          <div className="mt-6 flex items-center justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-gray-800/40 px-6 py-10 text-center">
            <p className="text-sm text-gray-400 font-saira">No advanced invoices yet.</p>
            <p className="mt-1 text-xs text-gray-500 font-saira">Build one above and it will appear here.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border border-white/10 bg-gray-800/40 p-4 lg:flex lg:items-center lg:justify-between lg:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-amber-300 font-saira">{inv.invoiceNumber}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold font-saira ${STATUS_COLOR[inv.status]}`}
                    >
                      {STATUS_LABEL[inv.status]}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-white font-saira">
                    {inv.customer.name}
                    {inv.customer.email ? ` · ${inv.customer.email}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 font-saira">
                    {formatDate(inv.createdAt)} · {inv.items.length} item{inv.items.length === 1 ? "" : "s"} ·{" "}
                    Advance <span className="text-amber-300">{formatLkr(inv.advanceAmount)}</span>
                    {inv.total > inv.advanceAmount ? (
                      <> · Balance <span className="text-emerald-300">{formatLkr(inv.total - inv.advanceAmount)}</span></>
                    ) : null}
                  </p>
                  {inv.emailedTo.length > 0 && (
                    <p className="mt-1 text-[11px] text-gray-500 font-saira">
                      Last sent to {inv.emailedTo[inv.emailedTo.length - 1].email} on{" "}
                      {formatDate(inv.emailedTo[inv.emailedTo.length - 1].sentAt)}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 lg:mt-0 lg:flex-nowrap">
                  <button
                    type="button"
                    onClick={() => void openPreview(inv)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 font-saira"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadInvoice(inv)}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 font-saira"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={() => openEmailModal(inv)}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
                  >
                    Send email
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product picker */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPickerOpen(false)}
        >
          <div
            className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div>
                <p className="text-base font-bold text-white font-saira">Add from catalog</p>
                <p className="text-xs text-gray-400 font-saira">
                  Select 10 ml or 100 ml for each fragrance, then enter the advance price.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="border-b border-white/10 p-3">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search by name or brand"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {productsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="h-7 w-7 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <p className="py-10 text-center text-sm text-gray-400 font-saira">No products match.</p>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((p) => {
                    const v10 = variantForSize(p, "10ml");
                    const v100 = variantForSize(p, "100ml");
                    return (
                      <div
                        key={p._id}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-gray-800/60 p-3"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-700">
                          {p.coverImageUrl ? (
                            <Image
                              src={p.coverImageUrl}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              {p.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white font-saira">
                            {p.brand ? <span className="text-amber-300">{p.brand} · </span> : null}
                            {p.name}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                          <button
                            type="button"
                            disabled={!v10}
                            onClick={() => {
                              addProductAsItem(p, "10ml");
                              setPickerOpen(false);
                            }}
                            className="rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-[10px] font-bold text-amber-100 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 font-saira"
                          >
                            10 ml
                            {v10 ? ` · ${formatLkr(retailPriceForVariant(v10))}` : ""}
                          </button>
                          <button
                            type="button"
                            disabled={!v100}
                            onClick={() => {
                              addProductAsItem(p, "100ml");
                              setPickerOpen(false);
                            }}
                            className="rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-[10px] font-bold text-amber-100 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40 font-saira"
                          >
                            100 ml
                            {v100 ? ` · ${formatLkr(retailPriceForVariant(v100))}` : ""}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF preview */}
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

      {/* Custom item modal */}
      {customOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setCustomOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gray-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
              <div>
                <h3 className="text-base font-bold text-white font-saira">Add custom item</h3>
                <p className="mt-1 text-xs text-gray-400 font-saira">
                  For special-order imports or items that are not in your catalog. Enter the details
                  manually.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Product name *
                </span>
                <input
                  type="text"
                  value={customForm.name}
                  onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Bvlgari Le Gemme Tygar"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                />
              </label>

              <label className="block">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Brand
                </span>
                <input
                  type="text"
                  value={customForm.brand}
                  onChange={(e) => setCustomForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="e.g. Bvlgari"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                />
              </label>

              <div className="block">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Size *
                </span>
                <div className="mt-1 grid grid-cols-3 gap-1.5">
                  {(["10 ml", "50 ml", "100 ml"] as const).map((opt) => {
                    const active = customForm.size === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setCustomForm((f) => ({ ...f, size: opt }))}
                        className={`rounded-lg border px-2 py-2 text-xs font-bold uppercase transition-colors font-saira ${
                          active
                            ? "border-amber-500 bg-amber-500 text-gray-900"
                            : "border-white/10 bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Unit price (LKR) *
                </span>
                <input
                  type="number"
                  min={0}
                  value={customForm.retailPrice}
                  onChange={(e) => setCustomForm((f) => ({ ...f, retailPrice: e.target.value }))}
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </label>

              <label className="block">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Quantity
                </span>
                <input
                  type="number"
                  min={1}
                  value={customForm.quantity}
                  onChange={(e) => setCustomForm((f) => ({ ...f, quantity: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="block text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                  Note (optional)
                </span>
                <input
                  type="text"
                  value={customForm.note}
                  onChange={(e) => setCustomForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Shown under the product name on the invoice"
                  className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
                />
              </label>

              {customError ? (
                <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 font-saira sm:col-span-2">
                  {customError}
                </p>
              ) : null}
            </div>

            <div className="flex gap-2 border-t border-white/10 bg-gray-900/60 px-5 py-4">
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 font-saira"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCustomItem}
                className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-amber-400 font-saira"
              >
                Add item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email modal */}
      {emailTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setEmailTarget(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-saira">Send invoice</h3>
                <p className="mt-1 text-xs text-gray-400 font-saira">
                  Invoice <span className="text-amber-300">{emailTarget.invoiceNumber}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailTarget(null)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                Recipient email
              </span>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
              />
            </label>

            <label className="mt-3 block">
              <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400 font-saira">
                Personal message (optional)
              </span>
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
                placeholder="Add a note for the recipient — it will appear above the PDF in the email."
                className="mt-1 w-full rounded-lg border border-white/10 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-amber-500/50 font-saira"
              />
            </label>

            {emailError ? (
              <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300 font-saira">{emailError}</p>
            ) : null}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setEmailTarget(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/10 font-saira"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={sendEmail}
                disabled={emailSending}
                className="flex-1 rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-gray-900 transition-colors hover:bg-amber-400 disabled:opacity-60 font-saira"
              >
                {emailSending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
