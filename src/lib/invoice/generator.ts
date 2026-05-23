import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import { ensureInvoiceFontsRegistered } from "./fonts";
import { InvoiceDocument } from "./template";
import type { InvoiceData } from "./types";

export async function generateInvoicePdfBuffer(data: InvoiceData): Promise<Buffer> {
  ensureInvoiceFontsRegistered();
  const element = createElement(InvoiceDocument, { data }) as unknown as ReactElement<DocumentProps>;
  return renderToBuffer(element);
}

export function invoiceFileName(data: InvoiceData): string {
  const safe = data.invoiceNumber.replace(/[^A-Za-z0-9_-]/g, "_");
  return `Aroma-Notes-Invoice-${safe}.pdf`;
}

export type { InvoiceData } from "./types";
