import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js"

const app = express();

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())

app.use("/api/v1/auth", authRouter)

export { app };
