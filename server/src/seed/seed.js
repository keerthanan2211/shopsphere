/**
 * Resets the database with demo products and two accounts:
 *   admin@shopsphere.dev    / Admin#2026  (admin)
 *   customer@shopsphere.dev / Shop#2026   (customer)
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { products } from './products.js';

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

await connectDB();
await Promise.all([Order.deleteMany({}), Product.deleteMany({}), User.deleteMany({})]);

const [, customer] = await User.create([
  { name: 'Store Admin', email: 'admin@shopsphere.dev', password: 'Admin#2026', role: 'admin' },
  { name: 'Ananya Rao', email: 'customer@shopsphere.dev', password: 'Shop#2026' },
]);

const created = await Product.insertMany(products.map((p) => ({ ...p, slug: slugify(p.name) })));

// A couple of reviews so ratings show up on first run
const dohar = created.find((p) => p.slug.startsWith('ajrakh'));
dohar.reviews.push({ user: customer._id, name: customer.name, rating: 5, comment: 'Beautiful colours and very soft after the first wash.' });
dohar.recalculateRating();
await dohar.save();

console.log(`Seeded ${created.length} products and 2 users.`);
console.log('Admin:    admin@shopsphere.dev / Admin#2026');
console.log('Customer: customer@shopsphere.dev / Shop#2026');
await mongoose.disconnect();
