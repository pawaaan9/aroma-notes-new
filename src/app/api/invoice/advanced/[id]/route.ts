import { NextRequest, NextResponse } from "next/server";
import { generateInvoicePdfBuffer, invoiceFileName } from "@/lib/invoice/generator";
import { invoiceFromAdvanced } from "@/lib/invoice/from-advanced";
import { fetchAdvancedInvoiceAdmin } from "@/lib/invoice/advanced-admin-fetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const inv = await fetchAdvancedInvoiceAdmin(id);
    if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const data = invoiceFromAdvanced(inv);
    const pdf = await generateInvoicePdfBuffer(data);
    const fileName = invoiceFileName(data);
    const disposition = req.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";

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
    console.error("[AdvancedInvoice] Download failed:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
