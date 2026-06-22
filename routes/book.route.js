import { Router } from "express";
import { createBook, getBooks, getBookById, updateBook, deleteBook } from "../controllers/book.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router()

// User
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin
router.post('/', authenticate, authorize('admin'), createBook);
router.patch('/:id', authenticate, authorize('admin'), updateBook);
router.delete('/:id', authenticate, authorize('admin'), deleteBook);

export default router;
