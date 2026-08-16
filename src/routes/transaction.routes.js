import express from "express";
import { createInitialFundsTransaction, createTransaction } from "../controllers/transaction.controller.js";
import {
  authMiddleware,
  authSystemUserMiddleware,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * - POST /api/v1/transactions
 * - Create a new trasaction
 */
router.post("/", authMiddleware, createTransaction);

/**
 * - POST /api/v1/transactions/system/initial-funds
 * - Add initial funds to the system
 */
router.post(
  "/system/initial-funds",
  authSystemUserMiddleware,
  createInitialFundsTransaction,
);

export default router;
