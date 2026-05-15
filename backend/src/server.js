import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./common/config/db.config.js";
import env from "./common/config/env.config.js";
import authRoutes from "./modules/auth/auth.routes.js";
import pollRoutes from "./modules/poll/poll.routes.js";
import voteRoutes from "./modules/votes/vote.routes.js";
import quizRoutes from "./modules/quiz/quiz.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import { errorHandler, notFound } from "./common/middleware/error.middleware.js";

const app = express();

const allowedOrigins = new Set([
    ...env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean),
    ...(env.isDev() ? ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"] : []),
]);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 80,
    standardHeaders: "draft-8",
    legacyHeaders: false,
});

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to Polling System API",
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

await connectDB();

app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
});

export default app;
