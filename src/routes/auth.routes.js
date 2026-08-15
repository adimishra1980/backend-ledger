import express from "express";
import { userLoginController, userRegisterController } from "../controllers/auth.controller.js";

const router = express.Router();

/** POST /api/v1/auth/register */
router.post("/register", userRegisterController);

/** POST /api/v1/auth/login */
router.post("/login", userLoginController)


export default router;
