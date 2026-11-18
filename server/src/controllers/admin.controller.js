import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { releaseStock } from '../services/inventory.js';
import { ApiError, asyncHandler } from '../utils/api-error.js';

/** Allowed order status changes. Anything else is rejected. */
export const TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const canTransition = (from, to) => TRANSITIONS[from]?.includes(to) ?? false;

export const stats = asyncHandler(async (_req, res) => {
  const [revenue, ordersByStatus, customers, lowStock, recentOrders] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.countDocuments({ role: 'customer' }),
    Product.find({ stock: { $lte: 5 } }).select('name slug stock').sort({ stock: 1 }).limit(8).lean(),
    Order.find().sort({ createdAt: -1 }).limit(6).populate('user', 'name email').lean(),
  ]);

  res.json({
    revenue: revenue[0]?.total ?? 0,
    paidOrders: revenue[0]?.count ?? 0,
    ordersByStatus: Object.fromEntries(ordersByStatus.map((s) => [s._id, s.count])),
    customers,
    lowStock,
    recentOrders,
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: String(req.query.status) } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(100).populate('user', 'name email').lean();
  res.json({ orders });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const { status } = req.body;
  if (!canTransition(order.status, status)) {
    throw new ApiError(400, `Can't change a ${order.status} order to ${status}`);
  }
  if (status === 'cancelled') await releaseStock(order.items);
  if (status === 'paid') order.paidAt = new Date();
  order.status = status;
  await order.save();
  res.json({ order });
});
