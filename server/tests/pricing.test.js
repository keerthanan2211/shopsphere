import { describe, expect, it } from 'vitest';
import { FREE_SHIPPING_THRESHOLD, mergeLines, priceOrder, SHIPPING_FEE } from '../src/services/pricing.js';

describe('priceOrder', () => {
  it('adds shipping and 12% GST below the free-shipping threshold', () => {
    const totals = priceOrder([{ price: 50000, quantity: 1 }]); // ₹500
    expect(totals).toEqual({ subtotal: 50000, shipping: SHIPPING_FEE, tax: 6000, total: 50000 + SHIPPING_FEE + 6000 });
  });

  it('ships free at or above the threshold', () => {
    expect(priceOrder([{ price: FREE_SHIPPING_THRESHOLD, quantity: 1 }]).shipping).toBe(0);
  });

  it('multiplies by quantity and sums lines', () => {
    expect(priceOrder([{ price: 10000, quantity: 3 }, { price: 25000, quantity: 2 }]).subtotal).toBe(80000);
  });

  it('keeps every amount a whole number of paise', () => {
    const totals = priceOrder([{ price: 33333, quantity: 1 }]);
    Object.values(totals).forEach((v) => expect(Number.isInteger(v)).toBe(true));
  });

  it('rejects empty orders and bad quantities', () => {
    expect(() => priceOrder([])).toThrow();
    expect(() => priceOrder([{ price: 100, quantity: 0 }])).toThrow();
    expect(() => priceOrder([{ price: 10.5, quantity: 1 }])).toThrow();
  });
});

describe('mergeLines', () => {
  it('combines duplicate products', () => {
    expect(mergeLines([{ productId: 'a', quantity: 1 }, { productId: 'b', quantity: 1 }, { productId: 'a', quantity: 2 }])).toEqual([
      { productId: 'a', quantity: 3 },
      { productId: 'b', quantity: 1 },
    ]);
  });
});
