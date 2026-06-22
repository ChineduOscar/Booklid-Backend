import { Router } from "express";
import { initializePayment, verifyPayment, paystackWebhook, getPaymentByReference, getAllUserPayment, getUserPayments } from "../controllers/payment.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router()


router.post("/webhook", paystackWebhook);
 
// User routes
router.post("/initialize", authenticate, initializePayment);
router.get("/verify/:reference", authenticate, verifyPayment);
router.get("/", authenticate, getUserPayments);
router.get("/:reference", authenticate, getPaymentByReference);
 
// Admin routes
router.get("/admin/all", authenticate, authorize('admin'), getAllUserPayment);

export default router