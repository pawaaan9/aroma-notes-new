import path from "node:path";
import { readFileSync } from "node:fs";
import { Font } from "@react-pdf/renderer";

/**
 * Disable hyphenation so words don't get broken in the PDF.
 * The template uses only the built-in PDF fonts (Helvetica, Times-Roman, Courier)
 * so no Font.register calls are needed.
 */
export function ensureInvoiceFontsRegistered(): void {
  Font.registerHyphenationCallback((word) => [word]);
}

let cachedLogoDataUri: string | null = null;

/** Load the Aroma Notes logo as a base64 data URI for embedding in the PDF. */
export function getLogoDataUri(): string {
  if (cachedLogoDataUri) return cachedLogoDataUri;
  try {
    const file = readFileSync(path.join(process.cwd(), "public/logo.png"));
    cachedLogoDataUri = `data:image/png;base64,${file.toString("base64")}`;
    return cachedLogoDataUri;
  } catch {
    // Fallback to empty 1x1 transparent PNG to avoid render failure if logo is missing.
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  }
}
