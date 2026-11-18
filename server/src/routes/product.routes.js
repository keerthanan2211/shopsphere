import { Router } from 'express';
import {
  addReview,
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam, productQuerySchema, productSchema, reviewSchema } from '../validators/schemas.js';

const router = Router();
router.get('/', validate(productQuerySchema, 'query'), listProducts);
router.get('/:slug', getProduct);
router.post('/', protect, adminOnly, validate(productSchema), createProduct);
router.patch('/:id', protect, adminOnly, validate(idParam, 'params'), validate(productSchema.partial()), updateProduct);
router.delete('/:id', protect, adminOnly, validate(idParam, 'params'), deleteProduct);
router.post('/:id/reviews', protect, validate(idParam, 'params'), validate(reviewSchema), addReview);
export default router;
