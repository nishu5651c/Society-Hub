import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFound } from "./errors.js";
import { router } from "./routes.js";
export const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ referrerPolicy: { policy: "strict-origin-when-cross-origin" } }));
app.use(cors({ origin: config.corsOrigin, credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
    const requestId = req.header("x-request-id") ?? crypto.randomUUID();
    res.setHeader("x-request-id", requestId);
    const started = Date.now();
    res.on("finish", () => console.info(JSON.stringify({ event: "request.complete", requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - started })));
    next();
});
const requestWindows = new Map();
const rateLimitTimer = setInterval(() => { const cutoff = Date.now() - 120_000; for (const [key, value] of requestWindows)
    if (value.startedAt < cutoff)
        requestWindows.delete(key); }, 60_000);
rateLimitTimer.unref();
app.use((req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    const current = requestWindows.get(key);
    if (!current || now - current.startedAt > 60_000)
        requestWindows.set(key, { startedAt: now, count: 1 });
    else
        current.count += 1;
    const windowState = requestWindows.get(key);
    res.setHeader("X-RateLimit-Limit", "120");
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, 120 - windowState.count)));
    if (windowState.count > 120)
        return res.status(429).json({ error: { message: "Too many requests" } });
    next();
});
app.use("/api/v1", router);
app.use(notFound);
app.use(errorHandler);
