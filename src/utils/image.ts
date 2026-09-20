/**
 * Hosts allowed by images.remotePatterns in next.config.ts. Keep the two lists
 * in sync: next/image throws a runtime error for any other host, which takes
 * the whole page down.
 */
const ALLOWED_IMAGE_HOSTS = [
  "firebasestorage.googleapis.com",
  "lh3.googleusercontent.com",
  "cdn.sanity.io",
];

export const FALLBACK_IMAGE = "/yusuf-bhai.webp";

/**
 * Guards next/image against stored URLs we no longer control, such as cart
 * items in localStorage or line items on historic orders. Anything from an
 * unconfigured host falls back to a local placeholder instead of crashing.
 */
export function safeImageUrl(url?: string | null): string {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) {
      return url;
    }
  } catch {
    /* not a parseable URL */
  }
  return FALLBACK_IMAGE;
}
