import { describe, expect, it } from 'vitest';
import reducer, { addItem, clearCart, MAX_QTY, removeItem, selectCartCount, selectCartSubtotal, setQuantity } from './cartSlice';

const product = (id, price, stock = 10) => ({ _id: id, slug: id, name: id, category: 'textiles', image: '', price, stock });
const run = (...actions) => actions.reduce(reducer, { items: [] });

describe('cart reducer', () => {
  it('adds a product and increments on repeat', () => {
    const state = run(addItem({ product: product('a', 1000) }), addItem({ product: product('a', 1000), quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it('never exceeds available stock', () => {
    const state = run(addItem({ product: product('a', 1000, 2), quantity: 5 }));
    expect(state.items[0].quantity).toBe(2);
  });

  it('caps quantity at the per-item maximum', () => {
    const state = run(addItem({ product: product('a', 1000, 100) }), setQuantity({ productId: 'a', quantity: 99 }));
    expect(state.items[0].quantity).toBe(MAX_QTY);
  });

  it('ignores out-of-stock products', () => {
    expect(run(addItem({ product: product('a', 1000, 0) })).items).toHaveLength(0);
  });

  it('removes an item when quantity drops to zero', () => {
    const state = run(addItem({ product: product('a', 1000) }), setQuantity({ productId: 'a', quantity: 0 }));
    expect(state.items).toHaveLength(0);
  });

  it('removes and clears', () => {
    const state = run(addItem({ product: product('a', 1) }), addItem({ product: product('b', 1) }), removeItem('a'));
    expect(state.items.map((i) => i.productId)).toEqual(['b']);
    expect(reducer(state, clearCart()).items).toEqual([]);
  });

  it('computes count and subtotal', () => {
    const cart = run(addItem({ product: product('a', 1000), quantity: 2 }), addItem({ product: product('b', 500) }));
    expect(selectCartCount({ cart })).toBe(3);
    expect(selectCartSubtotal({ cart })).toBe(2500);
  });
});
