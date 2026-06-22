import { Router } from 'express';
import {placeOrder, updateOrderStatus, getAllOrders, getOrders, getOrderById, cancelOrder } from '../controllers/order.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';

const router = Router();

router.get('/admin/orders', authenticate, authorize('admin'), getAllOrders);

router.post('/', authenticate, placeOrder);
router.get('/', authenticate, getOrders);
router.get('/:id', authenticate, getOrderById);
router.delete('/:id', authenticate, cancelOrder)

router.patch('/admin/orders/:id', authenticate, authorize('admin'), updateOrderStatus);

export default router;