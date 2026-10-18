import "dotenv/config";
import { z } from "zod";

const env = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url().optional(),
  APP_URL: z.string().url().optional(),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_SECRET: z.string().optional(),
  PAYMENT_PROVIDER: z.enum(["development", "stripe"]).default("development"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_PROVIDER: z.enum(["development", "smtp", "resend"]).default("development"),
  SMS_PROVIDER: z.enum(["development", "twilio"]).default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
}).parse(process.env);

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  databaseUrl: env.DATABASE_URL,
  appUrl: env.APP_URL ?? process.env.RENDER_EXTERNAL_URL,
  corsOrigin: env.CORS_ORIGIN.trim() === "same-origin"
    ? false
    : env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
  jwtSecret: env.JWT_SECRET,
  paymentProvider: env.PAYMENT_PROVIDER,
  stripeSecretKey: env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
  emailProvider: env.EMAIL_PROVIDER,
  smsProvider: env.SMS_PROVIDER,
  logLevel: env.LOG_LEVEL,
};

if (config.nodeEnv === "production") {
  if (!config.databaseUrl) throw new Error("DATABASE_URL is required in production");
  if (!config.jwtSecret || config.jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters in production");
  if (Array.isArray(config.corsOrigin) && (config.corsOrigin.length === 0 || config.corsOrigin.includes("*"))) {
    throw new Error("CORS_ORIGIN must explicitly allow the frontend or be set to same-origin in production");
  }
  if (config.emailProvider !== "development") throw new Error("A live email adapter is not implemented; do not select a live EMAIL_PROVIDER");
  if (config.smsProvider !== "development") throw new Error("A live SMS adapter is not implemented; do not select a live SMS_PROVIDER");
}
if (config.paymentProvider === "stripe") {
  if (!config.stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is required when PAYMENT_PROVIDER=stripe");
  if (!config.stripeWebhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is required when PAYMENT_PROVIDER=stripe");
  if (!config.appUrl) throw new Error("APP_URL or RENDER_EXTERNAL_URL is required when PAYMENT_PROVIDER=stripe");
  const appUrl = new URL(config.appUrl);
  if (config.nodeEnv === "production" && appUrl.protocol !== "https:") {
    throw new Error("APP_URL must use HTTPS in production");
  }
}
