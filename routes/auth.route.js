import {Router} from 'express';
import {login, register, logout} from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/logout', authenticate, logout);
router.post('/login', login);


export default router;