import { z } from 'zod';
import { CATEGORIES } from '../models/product.model.js';
import { ORDER_STATUSES } from '../models/order.model.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const productQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.enum(CATEGORIES).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  category: z.enum(CATEGORIES),
  origin: z.string().trim().max(80).optional(),
  price: z.number().int('Price must be in whole paise').min(0),
  stock: z.number().int().min(0),
  image: z.string().url().or(z.literal('')).optional(),
  featured: z.boolean().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3, 'Write at least a few words').max(1000),
});

export const createOrderSchema = z.object({
  items: z
    .array(z.object({ productId: objectId, quantity: z.number().int().min(1).max(20) }))
    .min(1, 'Your cart is empty')
    .max(50),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2).max(80),
    line1: z.string().trim().min(3).max(200),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    postalCode: z.string().trim().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
    phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number'),
  }),
});

export const orderStatusSchema = z.object({ status: z.enum(ORDER_STATUSES) });
export const idParam = z.object({ id: objectId });
