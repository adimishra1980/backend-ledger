import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  createAccountController,
  getAccountBalanceController,
  getUserAccountsController,
} from "../controllers/account.controller.js";

const router = express.Router();

/**
 * - POST /api/v1/accounts
 * - Create a new account
 * - Protected route
 */
router.post("/", authMiddleware, createAccountController);

/**
 * - GET /api/v1/accounts
 * - Get all accounts of logged-in user
 * - Protected route
 */
router.get("/", authMiddleware, getUserAccountsController);

/**
 * - GET /api/v1/accounts/balance/:accountId
 */

router.get("/balance/:accountId", authMiddleware, getAccountBalanceController);
export default router;
