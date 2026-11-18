import { Router } from 'express';
import { listOrders, stats, updateOrderStatus } from '../controllers/admin.controller.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idParam, orderStatusSchema } from '../validators/schemas.js';

const router = Router();
router.use(protect, adminOnly);
router.get('/stats', stats);
router.get('/orders', listOrders);
router.patch('/orders/:id/status', validate(idParam, 'params'), validate(orderStatusSchema), updateOrderStatus);
export default router;
