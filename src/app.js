import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

/**
 * - Routes required
 */
import authRouter from "./routes/auth.routes.js";
import accountRouter from "./routes/account.routes.js";
import transactionRouter from "./routes/transaction.routes.js";

/**
 * - Use Routes
 */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/transactions", transactionRouter);

export { app };
