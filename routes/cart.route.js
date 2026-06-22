import { Router } from "express";
import { addToCart, getCart, updateCart, clearCart, removeFromCart } from "../controllers/cart.controller.js";
import authenticate  from '../middleware/auth.middleware.js'
const router = Router()

router.get('/', authenticate, getCart)
router.post('/', authenticate, addToCart)
router.patch('/', authenticate, updateCart)
router.delete('/item', authenticate, removeFromCart)
router.delete('/', authenticate, clearCart)

export default router