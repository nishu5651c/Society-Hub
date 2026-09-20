import { z } from "zod";
import { HttpError } from "./errors.js";
export const validate = (schema) => (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success)
        return next(new HttpError(400, "Request validation failed", result.error.flatten()));
    const data = result.data;
    req.body = data.body;
    req.params = data.params;
    next();
};
export const idParams = z.object({ params: z.object({ id: z.string().min(1) }), body: z.unknown(), query: z.unknown() });
