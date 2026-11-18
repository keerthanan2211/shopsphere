import { env } from '../config/env.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { releaseStock, reserveStock } from '../services/inventory.js';
import { createCheckout, parseWebhook } from '../services/payment.js';
import { mergeLines, priceOrder } from '../services/pricing.js';
import { ApiError, asyncHandler } from '../utils/api-error.js';

/** POST /api/orders: prices the cart from the database, reserves stock, and starts payment. */
export const createOrder = asyncHandler(async (req, res) => {
  const lines = mergeLines(req.body.items);
  const products = await Product.find({ _id: { $in: lines.map((l) => l.productId) } }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const missing = lines.filter((l) => !byId.has(l.productId));
  if (missing.length) throw new ApiError(400, 'Some items in your cart are no longer available');

  const items = lines.map((l) => {
    const p = byId.get(l.productId);
    return { product: p._id, productId: l.productId, name: p.name, price: p.price, quantity: l.quantity };
  });

  const unavailable = await reserveStock(items);
  if (unavailable.length) {
    throw new ApiError(409, `Not enough stock for: ${unavailable.join(', ')}. Reduce the quantity and try again.`);
  }

  const order = await Order.create({
    user: req.user._id,
    items: items.map(({ product, name, price, quantity }) => ({ product, name, price, quantity })),
    shippingAddress: req.body.shippingAddress,
    ...priceOrder(items),
  });

  let checkoutUrl = null;
  try {
    checkoutUrl = await createCheckout(order);
  } catch (err) {
    // Payment provider failed: give the stock back and cancel, so nothing is left reserved
    await releaseStock(order.items);
    order.status = 'cancelled';
    await order.save();
    throw err;
  }

  res.status(201).json({ order, checkoutUrl, paymentMode: env.PAYMENT_MODE });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await findOrderFor(req);
  res.json({ order, paymentMode: env.PAYMENT_MODE });
});

/** POST /api/orders/:id/pay: demo payment, only available when PAYMENT_MODE=mock. */
export const payMock = asyncHandler(async (req, res) => {
  if (env.PAYMENT_MODE !== 'mock') throw new ApiError(400, 'Demo payments are turned off');
  const order = await findOrderFor(req);
  if (order.status !== 'pending') throw new ApiError(400, `This order is already ${order.status}`);
  await markPaid(order, `mock_${Date.now()}`);
  res.json({ order });
});

/** POST /api/orders/:id/cancel: customers can cancel until the order ships. */
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await findOrderFor(req);
  if (!['pending', 'paid'].includes(order.status)) {
    throw new ApiError(400, `A ${order.status} order can't be cancelled`);
  }
  await releaseStock(order.items);
  order.status = 'cancelled';
  await order.save();
  res.json({ order });
});

/** POST /api/payments/webhook: Stripe tells us a checkout finished. Needs the raw request body. */
export const stripeWebhook = asyncHandler(async (req, res) => {
  let event;
  try {
    event = parseWebhook(req.body, req.headers['stripe-signature']);
  } catch {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findById(session.metadata?.orderId);
    // Idempotent: Stripe may deliver the same event more than once
    if (order && order.status === 'pending') await markPaid(order, session.payment_intent ?? session.id);
  }
  res.json({ received: true });
});

async function findOrderFor(req) {
  const order = await Order.findById(req.params.id);
  // Customers only see their own orders; admins see all. 404 avoids revealing other orders exist.
  if (!order || (req.user.role !== 'admin' && !order.user.equals(req.user._id))) {
    throw new ApiError(404, 'Order not found');
  }
  return order;
}

async function markPaid(order, paymentRef) {
  order.status = 'paid';
  order.paymentRef = paymentRef;
  order.paidAt = new Date();
  await order.save();
}
