import nodemailer from "nodemailer";
import { generateInvoicePdfBuffer, invoiceFileName } from "@/lib/invoice/generator";
import type { InvoiceData, InvoiceLineItem } from "@/lib/invoice/types";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function paymentLabelForInvoice(method: string): string {
  switch (method) {
    case "cod":
      return "Cash on Delivery";
    case "bank_deposit":
      return "Bank Deposit";
    case "payzy":
      return "Payzy";
    case "advance":
      return "Advanced Payment";
    default:
      return method;
  }
}

function buildInvoiceFromOrderEmail(
  data: OrderEmailData,
  opts?: { paidNow?: boolean },
): InvoiceData {
  const items: InvoiceLineItem[] = data.items.map((it) => ({
    brand: it.brand ?? null,
    name: it.name,
    note: "Exclusive Import · Yusuf Bhai Collection",
    size: it.size ?? null,
    quantity: it.quantity,
    unitPrice: it.price,
  }));

  const now = new Date();
  const tail = (data.orderNumber || data.orderId || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(-6)
    .toUpperCase();
  const invoiceNumber = `AN-${now.getFullYear()}-${tail || "000000"}`;

  const payzyPlan =
    data.paymentMethod === "payzy" && data.total > 0
      ? { installments: 4, perInstallment: Math.round(data.total / 4) }
      : null;

  const status: InvoiceData["status"] =
    opts?.paidNow || data.paymentMethod === "payzy" ? "paid" : "awaiting";

  return {
    invoiceNumber,
    orderNumber: data.orderNumber,
    invoiceDate: now,
    paymentLabel: paymentLabelForInvoice(data.paymentMethod),
    billedTo: {
      name: data.customerName,
      email: data.customerEmail,
      phone: data.phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
    },
    items,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    total: data.total,
    status,
    payzyPlan,
    notes: data.notes,
  };
}

export type OrderEmailData = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: {
    name: string;
    brand?: string | null;
    size?: string | null;
    quantity: number;
    price: number;
    productId?: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  address: string;
  city: string;
  phone: string;
  state?: string;
  zip?: string;
  notes?: string;
  orderId?: string;
  bankSlipUrl?: string;
};

const F = "'Segoe UI',Arial,sans-serif";

function formatLkr(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString("en-LK")}`;
}

function paymentLabel(method: string): string {
  switch (method) {
    case "cod": return "Cash on Delivery";
    case "bank_deposit": return "Bank Deposit";
    case "payzy": return "Payzy (Buy Now, Pay Later)";
    case "advance": return "Advanced Payment";
    default: return method;
  }
}

function itemRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:12px 14px;border-bottom:1px solid #eef1f6;font-family:${F}">
          <div style="font-size:14px;font-weight:600;color:#111827">${it.name}</div>
          <div style="margin-top:3px;font-size:12px;color:#6b7280">${it.brand || "—"} &middot; ${it.size || "—"}</div>
        </td>
        <td style="padding:12px 14px;border-bottom:1px solid #eef1f6;font-family:${F};font-size:14px;color:#374151;text-align:center">${it.quantity}</td>
        <td style="padding:12px 14px;border-bottom:1px solid #eef1f6;font-family:${F};font-size:14px;font-weight:600;color:#111827;text-align:right">${formatLkr(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");
}

function adminItemRows(items: OrderEmailData["items"]): string {
  return items
    .map(
      (it) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f6;font-family:${F};font-size:12px;color:#4b5563;word-break:break-all">${it.productId || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f6;font-family:${F}">
          <div style="font-size:13px;font-weight:600;color:#111827">${it.name}</div>
          <div style="margin-top:2px;font-size:11px;color:#6b7280">${it.brand || "—"} &middot; ${it.size || "—"}</div>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f6;font-family:${F};font-size:13px;color:#374151;text-align:center">${it.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f6;font-family:${F};font-size:13px;color:#374151;text-align:right">${formatLkr(it.price)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eef1f6;font-family:${F};font-size:13px;font-weight:600;color:#111827;text-align:right">${formatLkr(it.price * it.quantity)}</td>
      </tr>`,
    )
    .join("");
}

function sectionTitle(text: string): string {
  return `<h3 style="margin:0 0 10px;font-family:${F};font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1.5px">${text}</h3>`;
}

function totalsBlock(data: OrderEmailData): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        <td style="padding:6px 0;font-family:${F};font-size:13px;color:#6b7280">Subtotal</td>
        <td style="padding:6px 0;font-family:${F};font-size:13px;color:#111827;text-align:right">${formatLkr(data.subtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:${F};font-size:13px;color:#6b7280">Delivery</td>
        <td style="padding:6px 0;font-family:${F};font-size:13px;color:#111827;text-align:right">${formatLkr(data.deliveryFee)}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0"><div style="margin:8px 0;border-top:2px solid #e5e7eb"></div></td>
      </tr>
      <tr>
        <td style="padding:4px 0;font-family:${F};font-size:16px;font-weight:700;color:#111827">Total</td>
        <td style="padding:4px 0;font-family:${F};font-size:16px;font-weight:700;color:#111827;text-align:right">${formatLkr(data.total)}</td>
      </tr>
    </table>`;
}

function deliveryBlock(data: OrderEmailData): string {
  const region = [data.city, data.state, data.zip].filter(Boolean).join(", ");
  return `
    ${sectionTitle("Delivery Address")}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:24px">
      <tr><td style="padding:12px 16px;font-family:${F}">
        <div style="font-size:14px;font-weight:600;color:#111827;margin-bottom:4px">${data.customerName}</div>
        <div style="font-size:13px;color:#4b5563;line-height:1.6">${data.address}<br/>${region || data.city}</div>
        <div style="font-size:13px;color:#4b5563;margin-top:4px">${data.phone}</div>
      </td></tr>
    </table>`;
}

function adminCustomerBlock(data: OrderEmailData): string {
  const region = [data.city, data.state, data.zip].filter(Boolean).join(", ");
  return `
    ${sectionTitle("Customer")}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:20px">
      <tr><td style="padding:14px 16px;font-family:${F};font-size:13px;color:#1f2937;line-height:1.65">
        <div><strong>Name:</strong> ${data.customerName}</div>
        <div><strong>Email:</strong> <a href="mailto:${data.customerEmail}" style="color:#b45309">${data.customerEmail}</a></div>
        <div><strong>Phone:</strong> ${data.phone}</div>
        <div style="margin-top:8px"><strong>Address:</strong><br/>${data.address}</div>
        <div><strong>City / Province / Postal:</strong> ${region || "—"}</div>
      </td></tr>
    </table>`;
}

function paymentBlock(data: OrderEmailData): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-bottom:24px">
      <tr><td style="padding:12px 16px;font-family:${F}">
        <div style="font-size:11px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:2px">Payment Method</div>
        <div style="font-size:14px;font-weight:600;color:#111827">${paymentLabel(data.paymentMethod)}</div>
      </td></tr>
    </table>`;
}

function baseLayout(title: string, accentColor: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;-webkit-font-smoothing:antialiased">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:24px 12px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <!-- Header -->
        <tr>
          <td style="background-color:#0f172a;padding:28px 24px;text-align:center">
            <h1 style="margin:0;font-family:${F};font-size:20px;font-weight:700;color:#ffffff;letter-spacing:2px">AROMA NOTES</h1>
            <p style="margin:6px 0 0;font-family:${F};font-size:11px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase">Luxury Fragrance Experience</p>
          </td>
        </tr>
        <!-- Accent bar -->
        <tr><td style="background-color:${accentColor};height:4px;font-size:0;line-height:0">&nbsp;</td></tr>
        <!-- Body -->
        <tr><td style="padding:28px 24px">${body}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:18px 24px;text-align:center;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-family:${F};font-size:11px;color:#9ca3af">Aroma Notes &mdash; Premium Fragrances, Sri Lanka</p>
            <p style="margin:4px 0 0;font-family:${F};font-size:10px;color:#d1d5db">This is an automated email. Please do not reply directly.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/*  Order Confirmation                                                 */
/* ------------------------------------------------------------------ */

export function buildOrderConfirmationHtml(data: OrderEmailData): string {
  const body = `
    <!-- Hero -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="text-align:center;padding:8px 0 0">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background-color:#ecfdf5;text-align:center;line-height:48px;font-size:22px">&#10003;</div>
      </td></tr>
      <tr><td style="text-align:center;padding:12px 0 0">
        <h2 style="margin:0;font-family:${F};font-size:22px;font-weight:700;color:#111827">Order Confirmed!</h2>
      </td></tr>
      <tr><td style="text-align:center;padding:6px 0 0">
        <p style="margin:0;font-family:${F};font-size:14px;color:#6b7280;line-height:1.6">Hi ${data.customerName}, thank you for choosing Aroma Notes.<br/>We have received your order and started preparing it.</p>
      </td></tr>
    </table>

    <!-- Order info bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;margin-bottom:24px">
      <tr>
        <td style="padding:14px 18px">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Order Number</div>
          <div style="font-family:${F};font-size:17px;font-weight:700;color:#ffffff;margin-top:2px">${data.orderNumber}</div>
        </td>
        <td style="padding:14px 18px;text-align:right">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Total</div>
          <div style="font-family:${F};font-size:17px;font-weight:700;color:#ffffff;margin-top:2px">${formatLkr(data.total)}</div>
        </td>
      </tr>
    </table>

    ${paymentBlock(data)}

    <!-- Items -->
    ${sectionTitle("Items Ordered")}
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px">
      <tr style="background-color:#f9fafb">
        <th style="padding:10px 14px;font-family:${F};font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Product</th>
        <th style="padding:10px 14px;font-family:${F};font-size:11px;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
        <th style="padding:10px 14px;font-family:${F};font-size:11px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
      </tr>
      ${itemRows(data.items)}
    </table>

    ${totalsBlock(data)}
    ${deliveryBlock(data)}

    <p style="margin:0;font-family:${F};font-size:13px;color:#6b7280;line-height:1.65;text-align:center">
      Your fragrance is being packed with care. We&rsquo;ll send another email once it&rsquo;s handed over to our courier.
    </p>`;

  return baseLayout("Order Confirmation - Aroma Notes", "#10b981", body);
}

/* ------------------------------------------------------------------ */
/*  New order — admin notification                                     */
/* ------------------------------------------------------------------ */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildNewOrderAdminHtml(data: OrderEmailData, receivedAtLabel: string): string {
  const bankBlock =
    data.bankSlipUrl && data.paymentMethod === "bank_deposit"
      ? `
    ${sectionTitle("Bank deposit slip")}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;margin-bottom:20px">
      <tr><td style="padding:14px 16px;font-family:${F}">
        <a href="${escapeHtml(data.bankSlipUrl!)}" style="color:#1d4ed8;font-size:14px;font-weight:600;word-break:break-all">Open uploaded slip</a>
      </td></tr>
    </table>`
      : "";

  const notesBlock = data.notes?.trim()
    ? `
    ${sectionTitle("Order notes (customer)")}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:20px">
      <tr><td style="padding:12px 16px;font-family:${F};font-size:13px;color:#374151;white-space:pre-wrap">${escapeHtml(data.notes.trim())}</td></tr>
    </table>`
    : "";

  const metaRows = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;margin-bottom:20px">
      <tr>
        <td style="padding:14px 18px">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Order number</div>
          <div style="font-family:${F};font-size:17px;font-weight:700;color:#ffffff;margin-top:2px">${escapeHtml(data.orderNumber)}</div>
          ${data.orderId ? `<div style="font-family:${F};font-size:11px;color:#94a3b8;margin-top:6px;word-break:break-all">ID: ${escapeHtml(data.orderId)}</div>` : ""}
        </td>
        <td style="padding:14px 18px;text-align:right;vertical-align:top">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Total</div>
          <div style="font-family:${F};font-size:17px;font-weight:700;color:#ffffff;margin-top:2px">${formatLkr(data.total)}</div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 18px 14px;font-family:${F};font-size:11px;color:#94a3b8">${escapeHtml(receivedAtLabel)}</td>
      </tr>
    </table>`;

  const body = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
      <tr><td style="text-align:center;padding:4px 0 0">
        <h2 style="margin:0;font-family:${F};font-size:20px;font-weight:700;color:#111827">New customer order</h2>
      </td></tr>
      <tr><td style="text-align:center;padding:8px 0 0">
        <p style="margin:0;font-family:${F};font-size:13px;color:#6b7280">A customer has just placed an order. Review the details below and fulfill it from your admin panel.</p>
      </td></tr>
    </table>

    ${metaRows}
    ${adminCustomerBlock(data)}
    ${paymentBlock(data)}
    ${bankBlock}
    ${notesBlock}

    ${sectionTitle("Line items")}
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:16px">
      <tr style="background-color:#f9fafb">
        <th style="padding:8px 10px;font-family:${F};font-size:10px;color:#6b7280;text-align:left;text-transform:uppercase">Product ID</th>
        <th style="padding:8px 10px;font-family:${F};font-size:10px;color:#6b7280;text-align:left;text-transform:uppercase">Product</th>
        <th style="padding:8px 10px;font-family:${F};font-size:10px;color:#6b7280;text-align:center;text-transform:uppercase">Qty</th>
        <th style="padding:8px 10px;font-family:${F};font-size:10px;color:#6b7280;text-align:right;text-transform:uppercase">Unit</th>
        <th style="padding:8px 10px;font-family:${F};font-size:10px;color:#6b7280;text-align:right;text-transform:uppercase">Line</th>
      </tr>
      ${adminItemRows(data.items)}
    </table>

    ${totalsBlock(data)}`;

  return baseLayout(`New order ${data.orderNumber} · Aroma Notes`, "#d97706", body);
}

const DEFAULT_ADMIN_ORDER_EMAIL = "nimsaraheshan08@gmail.com";

export async function sendNewOrderAdminEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return;
  }
  const to = (process.env.ADMIN_ORDER_EMAIL ?? DEFAULT_ADMIN_ORDER_EMAIL).trim();
  if (!to) return;

  const receivedAt = new Date().toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  });
  const receivedAtLabel = `Notification sent: ${receivedAt} (Asia/Colombo)`;

  await transporter.sendMail({
    from: `"Aroma Notes Orders" <${process.env.GMAIL_USER}>`,
    to,
    replyTo: data.customerEmail,
    subject: `New order: ${data.orderNumber} · ${data.customerName} | Aroma Notes`,
    html: buildNewOrderAdminHtml(data, receivedAtLabel),
  });
}

/* ------------------------------------------------------------------ */
/*  Shipped / Handed to Courier                                        */
/* ------------------------------------------------------------------ */

export function buildShippedEmailHtml(
  data: OrderEmailData & { deliveryDays: number },
): string {
  const body = `
    <!-- Hero -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="text-align:center;padding:8px 0 0">
        <div style="display:inline-block;width:48px;height:48px;border-radius:50%;background-color:#eff6ff;text-align:center;line-height:48px;font-size:22px">&#128666;</div>
      </td></tr>
      <tr><td style="text-align:center;padding:12px 0 0">
        <h2 style="margin:0;font-family:${F};font-size:22px;font-weight:700;color:#111827">Your Order Is On The Way!</h2>
      </td></tr>
      <tr><td style="text-align:center;padding:6px 0 0">
        <p style="margin:0;font-family:${F};font-size:14px;color:#6b7280;line-height:1.6">Hi ${data.customerName}, your order has been handed<br/>to our courier and is on its way to you.</p>
      </td></tr>
    </table>

    <!-- Order info bar -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;margin-bottom:16px">
      <tr>
        <td style="padding:14px 18px">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Order Number</div>
          <div style="font-family:${F};font-size:17px;font-weight:700;color:#ffffff;margin-top:2px">${data.orderNumber}</div>
        </td>
        <td style="padding:14px 18px;text-align:right">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px">Total</div>
          <div style="font-family:${F};font-size:17px;font-weight:700;color:#ffffff;margin-top:2px">${formatLkr(data.total)}</div>
        </td>
      </tr>
    </table>

    <!-- ETA highlight -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#059669;border-radius:8px;margin-bottom:24px">
      <tr>
        <td style="padding:18px;text-align:center">
          <div style="font-family:${F};font-size:10px;font-weight:700;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:1.5px">Estimated Delivery</div>
          <div style="font-family:${F};font-size:26px;font-weight:700;color:#ffffff;margin-top:4px">${data.deliveryDays} Working Day${data.deliveryDays > 1 ? "s" : ""}</div>
        </td>
      </tr>
    </table>

    ${paymentBlock(data)}

    <!-- Items -->
    ${sectionTitle("Items in This Shipment")}
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px">
      <tr style="background-color:#f9fafb">
        <th style="padding:10px 14px;font-family:${F};font-size:11px;color:#6b7280;text-align:left;text-transform:uppercase;letter-spacing:0.5px">Product</th>
        <th style="padding:10px 14px;font-family:${F};font-size:11px;color:#6b7280;text-align:center;text-transform:uppercase;letter-spacing:0.5px">Qty</th>
        <th style="padding:10px 14px;font-family:${F};font-size:11px;color:#6b7280;text-align:right;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
      </tr>
      ${itemRows(data.items)}
    </table>

    ${totalsBlock(data)}
    ${deliveryBlock(data)}

    <p style="margin:0;font-family:${F};font-size:13px;color:#6b7280;line-height:1.65;text-align:center">
      Thank you for shopping with Aroma Notes.<br/>We hope your fragrance arrives perfectly and on time!
    </p>`;

  return baseLayout("Your Order Has Been Shipped - Aroma Notes", "#3b82f6", body);
}

/* ------------------------------------------------------------------ */
/*  Senders                                                            */
/* ------------------------------------------------------------------ */

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Email] GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping email");
    return;
  }

  let pdfBuffer: Buffer | null = null;
  let pdfFileName = "Aroma-Notes-Invoice.pdf";
  try {
    const invoice = buildInvoiceFromOrderEmail(data);
    pdfBuffer = await generateInvoicePdfBuffer(invoice);
    pdfFileName = invoiceFileName(invoice);
  } catch (err) {
    console.error("[Email] Failed to build invoice PDF:", err);
  }

  await transporter.sendMail({
    from: `"Aroma Notes" <${process.env.GMAIL_USER}>`,
    to: data.customerEmail,
    subject: `Order Confirmed - ${data.orderNumber} | Aroma Notes`,
    html: buildOrderConfirmationHtml(data),
    attachments: pdfBuffer
      ? [
          {
            filename: pdfFileName,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ]
      : undefined,
  });
  try {
    await sendNewOrderAdminEmail(data);
  } catch (err) {
    console.error("[Email] Admin new-order notification failed:", err);
  }
}

export async function sendShippedEmail(
  data: OrderEmailData & { deliveryDays: number },
): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("[Email] GMAIL_USER / GMAIL_APP_PASSWORD not set, skipping email");
    return;
  }
  await transporter.sendMail({
    from: `"Aroma Notes" <${process.env.GMAIL_USER}>`,
    to: data.customerEmail,
    subject: `Your Order ${data.orderNumber} Has Been Shipped! | Aroma Notes`,
    html: buildShippedEmailHtml(data),
  });
}
