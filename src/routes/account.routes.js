import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createAccountController } from "../controllers/account.controller.js";

const router = express.Router();

/**
 * - POST /api/v1/accounts
 * - Create a new account
 * - Protected route
 */
router.post("/", authMiddleware, createAccountController);
export default router;
