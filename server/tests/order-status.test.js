import { describe, expect, it } from 'vitest';
import { canTransition } from '../src/controllers/admin.controller.js';

describe('order status transitions', () => {
  it('allows the normal fulfilment path', () => {
    expect(canTransition('pending', 'paid')).toBe(true);
    expect(canTransition('paid', 'shipped')).toBe(true);
    expect(canTransition('shipped', 'delivered')).toBe(true);
  });

  it('blocks skipping steps or reopening finished orders', () => {
    expect(canTransition('pending', 'delivered')).toBe(false);
    expect(canTransition('delivered', 'cancelled')).toBe(false);
    expect(canTransition('cancelled', 'paid')).toBe(false);
  });

  it('does not allow cancelling once shipped', () => {
    expect(canTransition('shipped', 'cancelled')).toBe(false);
  });
});
