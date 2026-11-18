import mongoose from 'mongoose';

export const CATEGORIES = ['textiles', 'brassware', 'ceramics', 'woodcraft', 'lighting'];

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 3000 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    origin: { type: String, trim: true }, // craft region, e.g. "Moradabad, Uttar Pradesh"
    /** Price in paise (integer) to avoid floating-point rounding errors with money */
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Full-text search across name and description
productSchema.index({ name: 'text', description: 'text' });

productSchema.methods.recalculateRating = function recalculateRating() {
  this.numReviews = this.reviews.length;
  this.rating = this.numReviews
    ? Math.round((this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.numReviews) * 10) / 10
    : 0;
};

export const Product = mongoose.model('Product', productSchema);
