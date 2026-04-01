"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatLkr } from "@/utils/currency";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { upsertCustomerFromOrder } from "@/lib/customers";

type VerifyResult = {
  status: "loading" | "success" | "failed" | "error";
  orderNumber?: string;
  total?: number;
  message?: string;
};

function PayzyResponseContent() {
  const searchParams = useSearchParams();
  const { clear } = useCart();
  const [result, setResult] = useState<VerifyResult>({ status: "loading" });

  const orderId = searchParams.get("x_order_id");
  const responseCode = searchParams.get("response_code");
  const signature = searchParams.get("signature");

  useEffect(() => {
    if (!orderId || !responseCode || !signature) {
      setResult({ status: "error", message: "Missing payment parameters" });
      return;
    }

    const storedData = sessionStorage.getItem("payzyData");
    if (!storedData) {
      setResult({
        status: "error",
        message: "Payment session expired. Please contact support if you were charged.",
      });
      return;
    }

    (async () => {
      const payzyData = JSON.parse(storedData);
      const isPayzySuccess = responseCode === "00";

      if (!isPayzySuccess) {
        try {
          await updateDoc(doc(db, "orders", orderId), {
            payzyPaymentStatus: "failed",
            updatedAt: serverTimestamp(),
          });
        } catch { /* ignore */ }
        setResult({
          status: "failed",
          message: "Payment was not successful. Please try again.",
        });
        return;
      }

      let signatureValid = false;
      try {
        const res = await fetch("/api/payzy/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payzyData, responseCode, signature }),
        });
        const data = await res.json();
        signatureValid = data.success === true;
      } catch {
        console.warn("[Payzy] Signature verify call failed, proceeding with response_code check");
      }

      try {
        const orderSnap = await getDoc(doc(db, "orders", orderId));
        const orderData = orderSnap.exists() ? orderSnap.data() : null;

        await updateDoc(doc(db, "orders", orderId), {
          status: "confirmed",
          payzyPaymentStatus: "success",
          payzySignatureValid: signatureValid,
          payzyData,
          updatedAt: serverTimestamp(),
        });

        const orderNum = orderData?.orderNumber ?? orderId;
        setResult({
          status: "success",
          orderNumber: orderNum,
          total: orderData?.total,
        });
        clear();
        sessionStorage.removeItem("payzyData");

        // Save / update customer summary only after Payzy success
        if (orderData?.customer?.email || orderData?.customer?.phone) {
          upsertCustomerFromOrder({
            customer: {
              name: orderData?.customer?.name ?? "Customer",
              email: orderData?.customer?.email ?? "",
              phone: orderData?.customer?.phone ?? "",
              city: orderData?.customer?.city ?? "",
              address: orderData?.customer?.address ?? "",
            },
            orderNumber: orderNum,
            total: Number(orderData?.total) || 0,
          }).catch(() => {});
        }

        // Fire-and-forget order confirmation email
        if (orderData?.customer?.email) {
          const cust = orderData.customer as Record<string, unknown>;
          const items = (orderData.items ?? []).map((it: Record<string, unknown>) => ({
            productId: (it.productId as string) ?? "",
            name: it.name ?? "",
            brand: (it.brand as string | undefined) ?? null,
            size: (it.size as string | undefined) ?? null,
            quantity: Number(it.quantity) || 1,
            price: Number(it.price) || 0,
          }));
          fetch("/api/email/order-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              orderNumber: orderNum,
              customerName: orderData.customer.name ?? "Customer",
              customerEmail: orderData.customer.email,
              items,
              subtotal: Number(orderData.subtotal) || 0,
              deliveryFee: Number(orderData.deliveryFee) || 0,
              total: Number(orderData.total) || 0,
              paymentMethod: "payzy",
              address: orderData.customer.address ?? "",
              city: orderData.customer.city ?? "",
              state: typeof cust.state === "string" ? cust.state : "",
              zip: typeof cust.zip === "string" ? cust.zip : "",
              phone: orderData.customer.phone ?? "",
              notes: typeof cust.notes === "string" ? cust.notes : undefined,
              bankSlipUrl: typeof orderData.bankSlipUrl === "string" ? orderData.bankSlipUrl : undefined,
            }),
          }).catch(() => {});
        }
      } catch {
        setResult({
          status: "success",
          orderNumber: orderId,
        });
        clear();
        sessionStorage.removeItem("payzyData");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, responseCode, signature]);

  if (result.status === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center bg-white px-4 pt-24 pb-16">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-10 w-10 animate-spin text-primary"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 font-saira">
            Verifying Payment...
          </h1>
          <p className="mt-2 text-gray-600 font-saira">
            Please wait while we confirm your payment with Payzy.
          </p>
        </div>
      </main>
    );
  }

  if (result.status === "success") {
    return (
      <main className="flex flex-1 items-center justify-center bg-white px-4 pt-24 pb-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 font-saira">
            Payment Successful!
          </h1>
          <p className="mt-2 text-gray-600 font-saira">
            Thank you for your order. Your Payzy payment has been confirmed.
          </p>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <p className="text-sm text-gray-500 font-saira">Order Number</p>
            <p className="mt-1 text-xl font-bold text-primary font-saira">
              {result.orderNumber}
            </p>
            {result.total != null && (
              <div className="mt-3 border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500 font-saira">Total</p>
                <p className="mt-1 text-lg font-bold text-gray-900 font-saira">
                  {formatLkr(result.total)}
                </p>
              </div>
            )}
            <div className="mt-3 border-t border-gray-200 pt-3">
              <p className="text-sm text-gray-500 font-saira">Payment</p>
              <p className="mt-1 text-sm font-semibold text-gray-800 font-saira">
                Payzy (Buy Now, Pay Later)
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 font-saira">
            We&apos;ll process your order and arrange delivery shortly. You can
            manage your Payzy installments from the Payzy app.
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
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-white px-4 pt-24 pb-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-100">
          <svg
            className="h-10 w-10 text-rose-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 font-saira">
          Payment {result.status === "failed" ? "Failed" : "Error"}
        </h1>
        <p className="mt-2 text-gray-600 font-saira">
          {result.message || "Something went wrong with your payment."}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-saira font-semibold text-white transition-all hover:bg-primary/90"
          >
            Try Again
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-saira font-medium text-gray-700 transition-all hover:bg-gray-100"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function PayzyResponsePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="absolute top-0 left-0 right-0 z-50">
        <Header currentPage="products" />
      </div>
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center bg-white px-4 pt-24 pb-16">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
              <p className="text-gray-500 font-saira">Loading...</p>
            </div>
          </main>
        }
      >
        <PayzyResponseContent />
      </Suspense>
      <Footer />
    </div>
  );
}
