import { Router } from 'express';
import { cancelOrder, createOrder, getOrder, myOrders, payMock } from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, idParam } from '../validators/schemas.js';

const router = Router();
router.use(protect);
router.post('/', validate(createOrderSchema), createOrder);
router.get('/mine', myOrders);
router.get('/:id', validate(idParam, 'params'), getOrder);
router.post('/:id/pay', validate(idParam, 'params'), payMock);
router.post('/:id/cancel', validate(idParam, 'params'), cancelOrder);
export default router;
