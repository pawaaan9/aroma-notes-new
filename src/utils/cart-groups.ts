import type { CartItem } from "@/contexts/CartContext";

export type CartGroup =
  | { kind: "item"; key: string; item: CartItem }
  | {
      kind: "combo";
      key: string;
      comboId: string;
      comboName: string;
      items: CartItem[];
      /** Sets of this combo in the cart. */
      quantity: number;
      /** Combo price for one set. */
      setPrice: number;
      /** What one set would cost buying the products separately. */
      setOriginalPrice: number;
    };

/**
 * Collapses the individual lines of a combo back into a single row, keeping
 * the original cart order. Combo lines all share a quantity, so the first
 * line's quantity represents the number of sets.
 */
export function groupCartItems(items: CartItem[]): CartGroup[] {
  const groups: CartGroup[] = [];
  const comboIndex = new Map<string, number>();

  for (const item of items) {
    if (!item.comboId) {
      groups.push({ kind: "item", key: item.id, item });
      continue;
    }

    const existing = comboIndex.get(item.comboId);
    if (existing === undefined) {
      comboIndex.set(item.comboId, groups.length);
      groups.push({
        kind: "combo",
        key: `combo:${item.comboId}`,
        comboId: item.comboId,
        comboName: item.comboName ?? "Combo offer",
        items: [item],
        quantity: item.quantity,
        setPrice: item.price ?? 0,
        setOriginalPrice: item.originalPrice ?? item.price ?? 0,
      });
      continue;
    }

    const group = groups[existing];
    if (group.kind !== "combo") continue;
    group.items.push(item);
    group.setPrice += item.price ?? 0;
    group.setOriginalPrice += item.originalPrice ?? item.price ?? 0;
  }

  return groups;
}
