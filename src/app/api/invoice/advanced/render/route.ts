import { NextRequest, NextResponse } from "next/server";
import { verifyAdminFromRequest } from "@/lib/firebase-admin";
import { generateInvoicePdfBuffer, invoiceFileName } from "@/lib/invoice/generator";
import { invoiceFromAdvanced } from "@/lib/invoice/from-advanced";
import { parseAdvancedInvoicePayload } from "@/lib/invoice/parse-advanced-invoice";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAdminFromRequest(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as { invoice?: unknown };
    const inv = parseAdvancedInvoicePayload(body.invoice);
    if (!inv) {
      return NextResponse.json({ error: "Invalid invoice data" }, { status: 400 });
    }

    const data = invoiceFromAdvanced(inv);
    const pdf = await generateInvoicePdfBuffer(data);
    const fileName = invoiceFileName(data);
    const download = req.nextUrl.searchParams.get("download") === "1";
    const disposition = download ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdf.length),
        "Content-Disposition": `${disposition}; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[AdvancedInvoice] Render failed:", err);
    return NextResponse.json({ error: "Failed to generate invoice PDF" }, { status: 500 });
  }
}
