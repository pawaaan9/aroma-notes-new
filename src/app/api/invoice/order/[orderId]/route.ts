import { NextRequest, NextResponse } from "next/server";
import { fetchOrderAdmin } from "@/lib/invoice/admin-order";
import { invoiceFromOrder } from "@/lib/invoice/from-order";
import { generateInvoicePdfBuffer, invoiceFileName } from "@/lib/invoice/generator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> },
) {
  try {
    const { orderId } = await ctx.params;
    if (!orderId) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    const order = await fetchOrderAdmin(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const invoice = invoiceFromOrder(order);
    const pdf = await generateInvoicePdfBuffer(invoice);
    const fileName = invoiceFileName(invoice);

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
    console.error("[Invoice] Failed to generate PDF:", err);
    return NextResponse.json({ error: "Failed to generate invoice" }, { status: 500 });
  }
}
