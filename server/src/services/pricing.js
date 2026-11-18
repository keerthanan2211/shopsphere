/**
 * Order pricing. All amounts are integers in paise (1 rupee = 100 paise).
 * Prices always come from the database, never from the client, so a user can't
 * change what they pay by editing the request.
 */
export const FREE_SHIPPING_THRESHOLD = 99900; // ₹999
export const SHIPPING_FEE = 7900; // ₹79
export const GST_RATE = 0.12; // 12% GST on handicrafts

export function priceOrder(lines) {
  if (!Array.isArray(lines) || lines.length === 0) throw new Error('An order needs at least one item');
  for (const l of lines) {
    if (!Number.isInteger(l.price) || l.price < 0) throw new Error('Prices must be whole paise');
    if (!Number.isInteger(l.quantity) || l.quantity < 1) throw new Error('Quantity must be at least 1');
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * GST_RATE);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

/** Merges duplicate product ids so [{a,1},{a,2}] becomes [{a,3}]. */
export function mergeLines(items) {
  const merged = new Map();
  for (const { productId, quantity } of items) {
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }
  return [...merged].map(([productId, quantity]) => ({ productId, quantity }));
}
