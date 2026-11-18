import { Product } from '../models/product.model.js';

/**
 * Reserves stock for each line with an atomic conditional update ($gte guard),
 * so two shoppers can never buy the last item at the same time.
 * If any line fails, everything already reserved is released again.
 * Returns the names of products that didn't have enough stock.
 */
export async function reserveStock(lines) {
  const reserved = [];
  const unavailable = [];

  for (const { productId, quantity, name } of lines) {
    const res = await Product.updateOne({ _id: productId, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
    if (res.modifiedCount === 1) reserved.push({ productId, quantity });
    else unavailable.push(name);
  }

  if (unavailable.length) await releaseStock(reserved);
  return unavailable;
}

export async function releaseStock(lines) {
  await Promise.all(
    lines.map(({ productId, product, quantity }) =>
      Product.updateOne({ _id: productId ?? product }, { $inc: { stock: quantity } }),
    ),
  );
}
