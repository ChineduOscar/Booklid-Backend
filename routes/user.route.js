import { Router } from 'express';
import {getAllUsers, getUser, getUserById, updateUser, updateUserById, deleteMe, deleteUser} from '../controllers/user.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import authorize from '../middleware/role.middleware.js';

const router = Router();

// User routes
router.get('/me', authenticate, getUser);
router.patch('/me', authenticate, updateUser);
router.delete('/me', authenticate, deleteMe);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllUsers);
router.get('/:id', authenticate, authorize('admin'), getUserById);
router.patch('/:id', authenticate, authorize('admin'), updateUserById);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;