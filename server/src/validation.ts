import { z } from "zod";
import type { RequestHandler } from "express";
import { HttpError } from "./errors.js";

export const validate = (schema: z.ZodType): RequestHandler => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) return next(new HttpError(400, "Request validation failed", result.error.flatten()));
  const data = result.data as { body: unknown; params: unknown; query: unknown };
  req.body = data.body;
  req.params = data.params;
  next();
};

export const idParams = z.object({ params: z.object({ id: z.string().min(1) }), body: z.unknown(), query: z.unknown() });
