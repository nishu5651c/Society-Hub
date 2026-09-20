import "dotenv/config";
import { z } from "zod";
const env = z.object({
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.string().url().optional(),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    JWT_SECRET: z.string().optional(),
    PAYMENT_PROVIDER: z.enum(["development", "stripe"]).default("development"),
    EMAIL_PROVIDER: z.enum(["development", "smtp", "resend"]).default("development"),
    SMS_PROVIDER: z.enum(["development", "twilio"]).default("development"),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
}).parse(process.env);
export const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    databaseUrl: env.DATABASE_URL,
    corsOrigin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
    jwtSecret: env.JWT_SECRET,
    paymentProvider: env.PAYMENT_PROVIDER,
    emailProvider: env.EMAIL_PROVIDER,
    smsProvider: env.SMS_PROVIDER,
    logLevel: env.LOG_LEVEL,
};
if (config.nodeEnv === "production") {
    if (!config.databaseUrl)
        throw new Error("DATABASE_URL is required in production");
    if (!config.jwtSecret || config.jwtSecret.length < 32)
        throw new Error("JWT_SECRET must be at least 32 characters in production");
    if (config.corsOrigin.length === 0 || config.corsOrigin.includes("*"))
        throw new Error("CORS_ORIGIN must explicitly allow the frontend in production");
    if (config.paymentProvider !== "development" && !process.env.PAYMENT_PROVIDER_SECRET)
        throw new Error("PAYMENT_PROVIDER_SECRET is required for a live payment provider");
}
