// Mirrors server/src/services/pricing.js so the cart shows the same totals the server will charge.
export const FREE_SHIPPING_THRESHOLD = 99900;
export const SHIPPING_FEE = 7900;
export const GST_RATE = 0.12;

export function estimateTotals(subtotal) {
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(subtotal * GST_RATE);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
