import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { HttpError } from "./errors.js";
import { userRepository } from "./repositories.js";
const tokenSecret = config.jwtSecret ?? (config.nodeEnv === "development" ? "development-only-change-me" : undefined);
if (!tokenSecret)
    throw new Error("JWT_SECRET is required outside development");
const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name, role: user.role });
export const hashPassword = (password) => bcrypt.hash(password, 12);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);
export const issueToken = (user) => jwt.sign({ sub: user.id }, tokenSecret, { expiresIn: "1d", issuer: "societyhub-api", audience: "societyhub-web" });
export const requireAuth = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer "))
            throw new HttpError(401, "Authentication required");
        const payload = jwt.verify(header.slice(7), tokenSecret, { issuer: "societyhub-api", audience: "societyhub-web" });
        if (!payload.sub)
            throw new HttpError(401, "Invalid token");
        const user = await userRepository.findById(payload.sub);
        if (!user)
            throw new HttpError(401, "Invalid token");
        req.user = publicUser(user);
        next();
    }
    catch (error) {
        next(error instanceof HttpError ? error : new HttpError(401, "Invalid token"));
    }
};
export const requireRoles = (...roles) => (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role))
        return next(new HttpError(403, "Insufficient permissions"));
    next();
};
