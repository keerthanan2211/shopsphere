import Stripe from 'stripe';
import { env } from '../config/env.js';

const stripe = env.PAYMENT_MODE === 'stripe' ? new Stripe(env.STRIPE_SECRET_KEY) : null;

/**
 * Starts payment for an order.
 * - stripe mode: creates a hosted Stripe Checkout session and returns its URL
 * - mock mode:   returns null; the client shows a "Pay now (demo)" button instead
 */
export async function createCheckout(order) {
  if (!stripe) return null;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'inr',
    line_items: [
      ...order.items.map((item) => ({
        quantity: item.quantity,
        price_data: { currency: 'inr', unit_amount: item.price, product_data: { name: item.name } },
      })),
      ...(order.shipping
        ? [{ quantity: 1, price_data: { currency: 'inr', unit_amount: order.shipping, product_data: { name: 'Shipping' } } }]
        : []),
      { quantity: 1, price_data: { currency: 'inr', unit_amount: order.tax, product_data: { name: 'GST (12%)' } } },
    ],
    metadata: { orderId: order._id.toString() },
    success_url: `${env.CLIENT_URL}/orders/${order._id}?payment=success`,
    cancel_url: `${env.CLIENT_URL}/orders/${order._id}?payment=cancelled`,
  });
  return session.url;
}

/** Verifies the webhook really came from Stripe (signature check) and returns the event. */
export function parseWebhook(rawBody, signature) {
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}

export const paymentsEnabled = () => Boolean(stripe);
