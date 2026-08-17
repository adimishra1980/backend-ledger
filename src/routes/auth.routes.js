import express from "express";
import {
  userLoginController,
  userLogoutController,
  userRegisterController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

/** POST /api/v1/auth/register */
router.post("/register", userRegisterController);

/** POST /api/v1/auth/login */
router.post("/login", userLoginController);

/**
 * - POST /api/v1/auth/logout
 */
router.post("/logout", authMiddleware, userLogoutController);

export default router;
