import { Product } from '../models/product.model.js';
import { ApiError, asyncHandler } from '../utils/api-error.js';

const SORTS = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, numReviews: -1 },
};

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** GET /api/products: search, filter by category and price, sort, and paginate. */
export const listProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = req.validatedQuery;

  const filter = {};
  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-reviews')
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({ products, page, pages: Math.max(1, Math.ceil(total / limit)), total });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, slug: await uniqueSlug(req.body.name) });
  res.status(201).json({ product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (req.body.name && req.body.name !== product.name) product.slug = await uniqueSlug(req.body.name, product._id);
  product.set(req.body);
  await product.save();
  res.json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  res.status(204).end();
});

/** POST /api/products/:id/reviews: one review per customer; updates the average rating. */
export const addReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (product.reviews.some((r) => r.user.equals(req.user._id))) {
    throw new ApiError(409, 'You have already reviewed this product');
  }
  product.reviews.push({ user: req.user._id, name: req.user.name, ...req.body });
  product.recalculateRating();
  await product.save();
  res.status(201).json({ rating: product.rating, numReviews: product.numReviews });
});

async function uniqueSlug(name, excludeId) {
  const base = slugify(name) || 'product';
  let slug = base;
  for (let i = 2; await Product.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }); i++) {
    slug = `${base}-${i}`;
  }
  return slug;
}
