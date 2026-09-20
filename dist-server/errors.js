export class HttpError extends Error {
    status;
    details;
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
        this.name = "HttpError";
    }
}
export const notFound = (_req, _res, next) => next(new HttpError(404, "Route not found"));
export const errorHandler = (error, req, res, _next) => {
    const status = error instanceof HttpError ? error.status : 500;
    const message = error instanceof HttpError ? error.message : "Internal server error";
    if (status === 500)
        console.error(JSON.stringify({ event: "request.error", requestId: res.getHeader("x-request-id"), method: req.method, path: req.path, error: error instanceof Error ? error.message : String(error) }));
    res.status(status).json({ error: { message, ...(error instanceof HttpError && error.details ? { details: error.details } : {}) } });
};
