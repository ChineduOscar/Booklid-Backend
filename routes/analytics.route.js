import { Router } from "express";
import { getAdminDashboardStats } from "../controllers/analytics.controller.js";

const router = Router()

router.get('/', getAdminDashboardStats)
export default router