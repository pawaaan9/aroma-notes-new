/** Client-side Meta Pixel standard e-commerce events. */

type MetaContent = {
  id: string;
  quantity: number;
  item_price?: number;
};

type LineItem = {
  id: string;
  name?: string;
  quantity: number;
  price?: number | null;
};

function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = window.fbq;
  if (typeof fbq !== "function") return;
  if (params) {
    fbq("track", event, params);
  } else {
    fbq("track", event);
  }
}

function lineItemsToParams(items: LineItem[], value: number) {
  const contents: MetaContent[] = items.map((it) => ({
    id: it.id,
    quantity: it.quantity,
    item_price: it.price ?? 0,
  }));
  return {
    content_ids: items.map((it) => it.id),
    contents,
    content_type: "product",
    num_items: items.reduce((n, it) => n + it.quantity, 0),
    value: Math.round(value),
    currency: "LKR",
  };
}

/** Product page view */
export function trackViewContent(product: {
  id: string;
  name: string;
  price?: number | null;
}) {
  fbqTrack("ViewContent", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    value: Math.round(product.price ?? 0),
    currency: "LKR",
  });
}

/** Item added to cart */
export function trackAddToCart(item: {
  id: string;
  name: string;
  price?: number | null;
  quantity?: number;
}) {
  const qty = item.quantity ?? 1;
  const price = item.price ?? 0;
  fbqTrack("AddToCart", {
    content_name: item.name,
    content_ids: [item.id],
    content_type: "product",
    contents: [{ id: item.id, quantity: qty, item_price: price }],
    value: Math.round(price * qty),
    currency: "LKR",
  });
}

/** Checkout page opened */
export function trackInitiateCheckout(items: LineItem[], total: number) {
  fbqTrack("InitiateCheckout", lineItemsToParams(items, total));
}

/** Order completed */
export function trackPurchase(
  items: LineItem[],
  total: number,
  orderId: string,
) {
  const key = `meta-purchase:${orderId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }

  fbqTrack("Purchase", {
    ...lineItemsToParams(items, total),
    order_id: orderId,
  });
}
