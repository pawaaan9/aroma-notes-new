"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatLkr } from "@/utils/currency";
import { createOrder, type OrderItem, type PaymentMethod } from "@/lib/orders";
import { fetchSettings } from "@/lib/settings";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
};

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [deliveryFeeConfig, setDeliveryFeeConfig] = useState<number | null>(null);

  // Fetch delivery fee from Firestore
  useEffect(() => {
    fetchSettings().then((s) => setDeliveryFeeConfig(s.deliveryFee));
  }, []);
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipError, setSlipError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<{
    orderNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
  } | null>(null);

  const DELIVERY_FEE = deliveryFeeConfig ?? 350; // fallback while loading
  const deliveryFee = total > 0 ? DELIVERY_FEE : 0;
  const grandTotal = total + deliveryFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSlipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlipError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file type & size
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setSlipError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSlipError("File must be less than 5MB.");
      return;
    }
    setSlipFile(file);
    setSlipPreview(URL.createObjectURL(file));
  };

  const removeSlip = () => {
    setSlipFile(null);
    if (slipPreview) URL.revokeObjectURL(slipPreview);
    setSlipPreview(null);
    setSlipError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const errs: Partial<FormData> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Invalid email address";
    }
    setErrors(errs);

    // Slip is required for bank deposit
    if (paymentMethod === "bank_deposit" && !slipFile) {
      setSlipError("Please upload your bank deposit slip.");
      return false;
    }

    return Object.keys(errs).length === 0;
  };

  const uploadSlip = async (): Promise<string | undefined> => {
    if (!slipFile) return undefined;
    const ext = slipFile.name.split(".").pop() ?? "jpg";
    const path = `bank-slips/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, slipFile);
    return getDownloadURL(fileRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;

    setSubmitting(true);
    try {
      // Upload slip first if bank deposit
      let bankSlipUrl: string | undefined;
      if (paymentMethod === "bank_deposit") {
        bankSlipUrl = await uploadSlip();
      }

      const orderItems: OrderItem[] = items.map((it) => ({
        productId: it.id,
        name: it.name,
        imageUrl: it.imageUrl,
        brand: it.brand,
        size: it.size,
        price: it.price ?? 0,
        quantity: it.quantity,
      }));

      const order = await createOrder({
        items: orderItems,
        subtotal: total,
        deliveryFee,
        total: grandTotal,
        paymentMethod,
        bankSlipUrl,
        customer: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          notes: form.notes.trim() || undefined,
        },
      });

      setOrderPlaced({ orderNumber: order.orderNumber, total: order.total, paymentMethod });
      clear();
    } catch (err) {
      console.error("Order failed:", err);
      alert("Something went wrong placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- Order success screen ---------- */
  if (orderPlaced) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="absolute top-0 left-0 right-0 z-50">
          <Header currentPage="products" dark />
        </div>
        <main className="flex flex-1 items-center justify-center bg-white px-4 pt-24 pb-16">
          <div className="mx-auto max-w-md text-center">
            {/* Success icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 font-saira">
              Order Placed Successfully!
            </h1>
            <p className="mt-2 text-gray-600 font-saira">
              Thank you for your order. We&apos;ll process it right away.
            </p>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="text-sm text-gray-500 font-saira">Order Number</p>
              <p className="mt-1 text-xl font-bold text-primary font-saira">
                {orderPlaced.orderNumber}
              </p>
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500 font-saira">Total</p>
                <p className="mt-1 text-lg font-bold text-gray-900 font-saira">
                  {formatLkr(orderPlaced.total)}
                </p>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500 font-saira">Payment</p>
                <p className="mt-1 text-sm font-semibold text-gray-800 font-saira">
                  {orderPlaced.paymentMethod === "bank_deposit"
                    ? "Bank Deposit (slip uploaded)"
                    : "Cash on Delivery"}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500 font-saira">
              {orderPlaced.paymentMethod === "bank_deposit"
                ? "We\u2019ve received your bank slip. We\u2019ll verify the payment and process your order shortly."
                : "We\u2019ll contact you via WhatsApp or phone to confirm your order and arrange delivery."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-saira font-semibold text-white transition-all hover:bg-primary/90"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-saira font-medium text-gray-700 transition-all hover:bg-gray-100"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------- Empty cart redirect ---------- */
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <div className="absolute top-0 left-0 right-0 z-50">
          <Header currentPage="products" dark />
        </div>
        <main className="flex flex-1 items-center justify-center bg-white px-4 pt-24 pb-16">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 font-saira">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-500 font-saira">
              Add some items before checking out.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-saira font-semibold text-white transition-all hover:bg-primary/90"
            >
              Browse Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------- Checkout form ---------- */
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" dark />
      </div>

      <main className="flex-grow bg-white pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back to cart link */}
          <Link
            href="/cart"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 font-saira"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Cart
          </Link>

          <h1 className="mb-8 text-3xl font-bold text-gray-900 font-saira">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Customer details form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-5 text-lg font-bold text-gray-900 font-saira">
                    Customer Details
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Perera"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-all font-saira placeholder:text-gray-400 focus:ring-2 ${
                          errors.name
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                            : "border-gray-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-rose-500 font-saira">{errors.name}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="077 123 4567"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-all font-saira placeholder:text-gray-400 focus:ring-2 ${
                          errors.phone
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                            : "border-gray-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-rose-500 font-saira">{errors.phone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                        Email <span className="text-xs text-gray-400">(optional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-all font-saira placeholder:text-gray-400 focus:ring-2 ${
                          errors.email
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                            : "border-gray-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-rose-500 font-saira">{errors.email}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                        Delivery Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="123, Temple Road, Dehiwala"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-all font-saira placeholder:text-gray-400 focus:ring-2 ${
                          errors.address
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                            : "border-gray-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                      {errors.address && (
                        <p className="mt-1 text-xs text-rose-500 font-saira">{errors.address}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Colombo"
                        className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 outline-none transition-all font-saira placeholder:text-gray-400 focus:ring-2 ${
                          errors.city
                            ? "border-rose-400 focus:border-rose-500 focus:ring-rose-200"
                            : "border-gray-300 focus:border-primary focus:ring-primary/20"
                        }`}
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-rose-500 font-saira">{errors.city}</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                        Order Notes <span className="text-xs text-gray-400">(optional)</span>
                      </label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Any special instructions for your order..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-all font-saira placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment method selection */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-lg font-bold text-gray-900 font-saira">
                    Payment Method
                  </h2>

                  <div className="space-y-3">
                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        paymentMethod === "cod" ? "border-primary" : "border-gray-300"
                      }`}>
                        {paymentMethod === "cod" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 font-saira">Cash on Delivery</p>
                        <p className="text-sm text-gray-500 font-saira">
                          Pay when you receive your order
                        </p>
                      </div>
                    </button>

                    {/* Bank Deposit */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("bank_deposit")}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                        paymentMethod === "bank_deposit"
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                        paymentMethod === "bank_deposit" ? "border-primary" : "border-gray-300"
                      }`}>
                        {paymentMethod === "bank_deposit" && (
                          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 font-saira">Bank Deposit</p>
                        <p className="text-sm text-gray-500 font-saira">
                          Transfer to our bank account &amp; upload slip
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Bank details + slip upload (shown when bank_deposit selected) */}
                  {paymentMethod === "bank_deposit" && (
                    <div className="mt-4 space-y-4">
                      {/* Bank details card */}
                      <div className="overflow-hidden rounded-xl border border-gray-200">
                        {/* Card header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                            </svg>
                            <h3 className="text-sm font-bold text-white font-saira">Bank Account Details</h3>
                          </div>
                        </div>
                        {/* Details rows */}
                        <div className="divide-y divide-gray-100 bg-white">
                          <div className="flex items-center px-5 py-3">
                            <span className="w-36 shrink-0 text-xs uppercase tracking-wider text-gray-400 font-saira">Account Name</span>
                            <span className="font-semibold text-gray-900 font-saira text-sm">NH Atharagalla</span>
                          </div>
                          <div className="flex items-center px-5 py-3">
                            <span className="w-36 shrink-0 text-xs uppercase tracking-wider text-gray-400 font-saira">Bank</span>
                            <span className="font-semibold text-gray-900 font-saira text-sm">Sampath Bank</span>
                          </div>
                          <div className="flex items-center px-5 py-3">
                            <span className="w-36 shrink-0 text-xs uppercase tracking-wider text-gray-400 font-saira">Branch</span>
                            <span className="font-semibold text-gray-900 font-saira text-sm">Peradeniya</span>
                          </div>
                          <div className="flex items-center px-5 py-3">
                            <span className="w-36 shrink-0 text-xs uppercase tracking-wider text-gray-400 font-saira">Account No.</span>
                            <span className="font-bold text-gray-900 font-saira text-sm tracking-widest">105155213764</span>
                          </div>
                        </div>
                        {/* Footer note */}
                        <div className="bg-amber-50 px-5 py-2.5 border-t border-amber-100">
                          <p className="flex items-start gap-2 text-xs text-amber-700 font-saira">
                            <svg className="h-3.5 w-3.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            Please transfer the exact total amount and upload the deposit slip below.
                          </p>
                        </div>
                      </div>

                      {/* Slip upload */}
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700 font-saira">
                          Upload Bank Deposit Slip <span className="text-rose-500">*</span>
                        </label>

                        {!slipFile ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                              slipError
                                ? "border-rose-300 bg-rose-50"
                                : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
                            }`}
                          >
                            <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <p className="mt-2 text-sm font-medium text-gray-700 font-saira">
                              Click to upload your deposit slip
                            </p>
                            <p className="mt-1 text-xs text-gray-500 font-saira">
                              JPG, PNG or WebP (max 5MB)
                            </p>
                          </div>
                        ) : (
                          <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                {slipPreview && (
                                  <Image
                                    src={slipPreview}
                                    alt="Bank slip preview"
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 font-saira truncate">
                                  {slipFile.name}
                                </p>
                                <p className="text-xs text-gray-500 font-saira">
                                  {(slipFile.size / 1024).toFixed(0)} KB
                                </p>
                                <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="font-saira">Ready to upload</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={removeSlip}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200 hover:text-rose-600"
                                aria-label="Remove slip"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleSlipChange}
                          className="hidden"
                        />
                        {slipError && (
                          <p className="mt-1 text-xs text-rose-500 font-saira">{slipError}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order summary sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 font-saira">Order Summary</h2>

                  {/* Items preview */}
                  <div className="mt-4 max-h-64 space-y-3 overflow-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 font-saira line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-500 font-saira">
                            {item.size ? `${item.size} • ` : ""}Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 font-saira">
                          {typeof item.price === "number"
                            ? formatLkr(item.price * item.quantity)
                            : "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-5 space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm font-saira">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">{formatLkr(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-saira">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-gray-900">{formatLkr(deliveryFee)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between font-saira">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-primary">
                          {formatLkr(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Place order button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    onClick={handleSubmit}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 font-saira font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
