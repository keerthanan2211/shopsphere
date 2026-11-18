import { configureStore } from '@reduxjs/toolkit';
import { api } from '../features/api/apiSlice';
import cartReducer, { loadCart, saveCart } from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: { cart: cartReducer, [api.reducerPath]: api.reducer },
  preloadedState: { cart: loadCart() },
  middleware: (getDefault) => getDefault().concat(api.middleware),
});

// Persist the cart so it survives refreshes and return visits
let lastCart = store.getState().cart;
store.subscribe(() => {
  const { cart } = store.getState();
  if (cart !== lastCart) {
    lastCart = cart;
    saveCart(cart);
  }
});
