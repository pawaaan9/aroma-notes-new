import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { verifyAdminFromRequest } from "@/lib/firebase-admin";
import { generateInvoicePdfBuffer, invoiceFileName } from "@/lib/invoice/generator";
import { invoiceFromAdvanced } from "@/lib/invoice/from-advanced";
import { fetchAdvancedInvoiceAdmin } from "@/lib/invoice/advanced-admin-fetch";
import { parseAdvancedInvoicePayload } from "@/lib/invoice/parse-advanced-invoice";
import type { AdvancedInvoice } from "@/lib/advanced-invoices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function fmt(n: number): string {
  return `LKR ${Math.round(n).toLocaleString("en-LK")}`;
}

function emailHtml(inv: AdvancedInvoice, message?: string): string {
  const greetingName = inv.customer.name || "Customer";
  const safeMessage = (message ?? "").trim();
  const messageBlock = safeMessage
    ? `<p style="margin:0 0 14px;font-size:14px;line-height:1.65;color:#374151;white-space:pre-wrap">${safeMessage
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</p>`
    : "";

  const balance = Math.max(0, inv.total - inv.advanceAmount);
  const hasBalance = balance > 0;

  const balanceBlock = hasBalance
    ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #d97706;border-radius:10px;background:#fffbeb;margin:0 0 18px">
            <tr><td style="padding:18px 20px">
              <div style="font-size:11px;font-weight:700;color:#b45309;text-transform:uppercase;letter-spacing:2px">Balance Due</div>
              <div style="font-size:30px;font-weight:700;color:#b45309;margin-top:6px;font-family:Georgia,'Times New Roman',serif;letter-spacing:0.5px">${fmt(balance)}</div>
              <div style="font-size:12px;color:#92400e;margin-top:6px">Payable on delivery / collection.</div>
            </td></tr>
          </table>`
    : "";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#0f172a;padding:24px;text-align:center">
          <h1 style="margin:0;font-size:18px;color:#fff;letter-spacing:2px">AROMA NOTES</h1>
          <p style="margin:6px 0 0;font-size:11px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase">Invoice</p>
        </td></tr>
        <tr><td style="background:#d97706;height:4px;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:24px">
          <h2 style="margin:0 0 12px;font-size:18px;color:#111827">Hello ${greetingName},</h2>
          <p style="margin:0 0 14px;font-size:14px;color:#374151;line-height:1.65">
            Please find your invoice <strong>${inv.invoiceNumber}</strong> attached as a PDF.
          </p>
          ${messageBlock}

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;margin:0 0 14px">
            <tr><td style="padding:16px 20px">
              <div style="font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;letter-spacing:2px">Advance Paid</div>
              <div style="font-size:22px;font-weight:700;color:#ffffff;margin-top:4px;font-family:Georgia,'Times New Roman',serif">${fmt(inv.advanceAmount)}</div>
              <div style="font-size:12px;color:#94a3b8;margin-top:6px">Order total ${fmt(inv.total)}</div>
            </td></tr>
          </table>

          ${balanceBlock}

          <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.65">If you have any questions, just reply to this email — we are happy to help.</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:11px;color:#9ca3af">Aroma Notes &mdash; Premium Fragrances, Sri Lanka</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const uid = await verifyAdminFromRequest(req);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      message?: string;
      invoice?: unknown;
    };

    const targetEmail = (body.email ?? "").trim();
    if (!targetEmail || !/^.+@.+\..+$/.test(targetEmail)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        { error: "Email is not configured on the server" },
        { status: 500 },
      );
    }

    let inv = parseAdvancedInvoicePayload(body.invoice);
    if (!inv) {
      inv = await fetchAdvancedInvoiceAdmin(id);
    }
    if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const data = invoiceFromAdvanced(inv);
    const pdf = await generateInvoicePdfBuffer(data);
    const fileName = invoiceFileName(data);

    await transporter.sendMail({
      from: `"Aroma Notes" <${process.env.GMAIL_USER}>`,
      to: targetEmail,
      subject: `Invoice ${inv.invoiceNumber} | Aroma Notes`,
      html: emailHtml(inv, body.message),
      attachments: [
        { filename: fileName, content: pdf, contentType: "application/pdf" },
      ],
    });

    return NextResponse.json({ success: true, sentTo: targetEmail });
  } catch (err) {
    console.error("[AdvancedInvoice] Email failed:", err);
    return NextResponse.json({ error: "Failed to send invoice email" }, { status: 500 });
  }
}
