import { createSlice } from '@reduxjs/toolkit';

export const MAX_QTY = 20;
const STORAGE_KEY = 'shopsphere-cart';

export function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    return Array.isArray(saved?.items) ? saved : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function saveCart(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked: the cart still works for this visit */
  }
}

/**
 * The cart keeps a snapshot (name, price, slug) for display, but the server re-prices
 * every order from the database at checkout, so a stale or edited price can't be charged.
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    addItem(state, { payload }) {
      const { product, quantity = 1 } = payload;
      const existing = state.items.find((i) => i.productId === product._id);
      const cap = Math.min(MAX_QTY, product.stock);
      if (existing) {
        existing.quantity = Math.min(cap, existing.quantity + quantity);
      } else if (cap > 0) {
        state.items.push({
          productId: product._id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          image: product.image,
          price: product.price,
          stock: product.stock,
          quantity: Math.min(cap, quantity),
        });
      }
    },
    setQuantity(state, { payload: { productId, quantity } }) {
      const item = state.items.find((i) => i.productId === productId);
      if (!item) return;
      if (quantity <= 0) state.items = state.items.filter((i) => i.productId !== productId);
      else item.quantity = Math.min(quantity, MAX_QTY, item.stock);
    },
    removeItem(state, { payload: productId }) {
      state.items = state.items.filter((i) => i.productId !== productId);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (state) => state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
