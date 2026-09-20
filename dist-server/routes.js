import { Router } from "express";
import { z } from "zod";
import { idParams, validate } from "./validation.js";
import { applicationRepository, leaseRepository, maintenanceRepository, memberRepository, messagingRepository, notificationRepository, paymentRepository, propertyRepository, userRepository } from "./repositories.js";
import { hashPassword, issueToken, requireAuth, requireRoles, verifyPassword } from "./auth.js";
import { HttpError } from "./errors.js";
import { persistenceMode } from "./db.js";
import { chatTransport, paymentProvider } from "./providers.js";
export const router = Router();
router.get("/health", (_req, res) => res.json({ status: "ok", service: "societyhub-api", persistence: persistenceMode }));
router.get("/health/live", (_req, res) => res.json({ status: "ok" }));
router.get("/health/ready", async (_req, res, next) => {
    try {
        if (!persistenceMode || persistenceMode === "development-fallback")
            return res.status(503).json({ status: "not_ready", reason: "database_not_configured" });
        const { prisma } = await import("./db.js");
        if (prisma)
            await prisma.$queryRaw `SELECT 1`;
        res.json({ status: "ready", persistence: persistenceMode });
    }
    catch (error) {
        next(new HttpError(503, "Database is not ready"));
    }
});
router.post("/auth/register", validate(z.object({
    body: z.object({ email: z.string().email(), name: z.string().trim().min(2), password: z.string().min(8) }),
    params: z.unknown(), query: z.unknown(),
})), async (req, res, next) => {
    try {
        if (await userRepository.findByEmail(req.body.email))
            throw new HttpError(409, "Email already registered");
        const user = await userRepository.create({ email: req.body.email, name: req.body.name, passwordHash: await hashPassword(req.body.password) });
        res.status(201).json({ data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: issueToken(user) } });
    }
    catch (error) {
        next(error);
    }
});
router.post("/auth/login", validate(z.object({
    body: z.object({ email: z.string().email(), password: z.string().min(1) }),
    params: z.unknown(), query: z.unknown(),
})), async (req, res, next) => {
    try {
        const user = await userRepository.findByEmail(req.body.email);
        if (!user || !(await verifyPassword(req.body.password, user.passwordHash)))
            throw new HttpError(401, "Invalid email or password");
        res.json({ data: { user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: issueToken(user) } });
    }
    catch (error) {
        next(error);
    }
});
router.get("/auth/me", requireAuth, (req, res) => res.json({ data: req.user }));
router.post("/auth/logout", requireAuth, (_req, res) => res.status(204).send());
router.get("/properties", requireAuth, async (_req, res, next) => { try {
    res.json({ data: await propertyRepository.list() });
}
catch (error) {
    next(error);
} });
router.post("/properties", validate(z.object({
    body: z.object({ name: z.string().trim().min(2), address: z.string().trim().min(2), units: z.coerce.number().int().positive() }),
    params: z.unknown(), query: z.unknown(),
})), requireAuth, requireRoles("ADMIN", "MANAGER"), async (req, res, next) => { try {
    res.status(201).json({ data: await propertyRepository.create(req.body) });
}
catch (error) {
    next(error);
} });
router.get("/properties/:id", requireAuth, validate(idParams), async (req, res, next) => { try {
    res.json({ data: await propertyRepository.find(req.params.id) });
}
catch (error) {
    next(error);
} });
router.get("/maintenance", requireAuth, async (req, res, next) => { try {
    res.json({ data: await maintenanceRepository.list(req.user) });
}
catch (error) {
    next(error);
} });
router.post("/maintenance", validate(z.object({
    body: z.object({
        propertyId: z.string().min(1), title: z.string().trim().min(3), location: z.string().trim().min(2),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
    }),
    params: z.unknown(), query: z.unknown(),
})), requireAuth, async (req, res, next) => {
    try {
        await propertyRepository.find(req.body.propertyId);
        res.status(201).json({ data: await maintenanceRepository.create({ ...req.body, reporterId: req.user.id }) });
    }
    catch (error) {
        next(error);
    }
});
const leaseInput = z.object({
    propertyId: z.string().min(1), tenantId: z.string().min(1), unit: z.string().trim().min(1),
    monthlyRent: z.coerce.number().int().positive(), startsAt: z.coerce.date(), endsAt: z.coerce.date(),
}).refine((value) => value.endsAt > value.startsAt, { message: "Lease end must be after start", path: ["endsAt"] });
router.get("/leases", requireAuth, async (req, res, next) => { try {
    res.json({ data: await leaseRepository.list(req.user) });
}
catch (error) {
    next(error);
} });
router.post("/leases", requireAuth, requireRoles("ADMIN", "MANAGER", "STAFF"), validate(z.object({ body: leaseInput, params: z.unknown(), query: z.unknown() })), async (req, res, next) => {
    try {
        res.status(201).json({ data: await leaseRepository.create(req.body) });
    }
    catch (error) {
        next(error);
    }
});
const paymentInput = z.object({
    propertyId: z.string().min(1), leaseId: z.string().min(1).optional(), payerId: z.string().min(1),
    amount: z.coerce.number().int().positive(), dueDate: z.coerce.date(), status: z.enum(["PENDING", "PAID", "OVERDUE", "FAILED"]).optional(),
    paidAt: z.coerce.date().optional(),
});
router.get("/payments", requireAuth, async (req, res, next) => { try {
    res.json({ data: await paymentRepository.list(req.user) });
}
catch (error) {
    next(error);
} });
router.post("/payments", requireAuth, requireRoles("ADMIN", "MANAGER", "STAFF"), validate(z.object({ body: paymentInput, params: z.unknown(), query: z.unknown() })), async (req, res, next) => {
    try {
        res.status(201).json({ data: await paymentRepository.create(req.body) });
    }
    catch (error) {
        next(error);
    }
});
router.post("/payments/:id/checkout", requireAuth, validate(z.object({
    body: z.object({ returnUrl: z.string().url() }), params: idParams.shape.params, query: z.unknown(),
})), async (req, res, next) => {
    try {
        const payment = (await paymentRepository.list(req.user)).find((item) => item.id === req.params.id);
        if (!payment)
            throw new HttpError(404, "Payment not found");
        const checkout = await paymentProvider.createCheckout({ paymentId: payment.id, amount: payment.amount, currency: "INR", returnUrl: req.body.returnUrl });
        res.json({ data: checkout });
    }
    catch (error) {
        next(error);
    }
});
const memberInput = z.object({ userId: z.string().min(1), propertyId: z.string().min(1), unit: z.string().trim().min(1).optional() });
router.get("/members", requireAuth, async (req, res, next) => { try {
    res.json({ data: await memberRepository.list(req.user) });
}
catch (error) {
    next(error);
} });
router.post("/members", requireAuth, requireRoles("ADMIN", "MANAGER"), validate(z.object({ body: memberInput, params: z.unknown(), query: z.unknown() })), async (req, res, next) => {
    try {
        res.status(201).json({ data: await memberRepository.create(req.body) });
    }
    catch (error) {
        next(error);
    }
});
router.get("/notifications", requireAuth, async (req, res, next) => { try {
    res.json({ data: await notificationRepository.list(req.user.id) });
}
catch (error) {
    next(error);
} });
router.patch("/notifications/:id/read", requireAuth, validate(idParams), async (req, res, next) => {
    try {
        res.json({ data: await notificationRepository.markRead(req.user.id, req.params.id) });
    }
    catch (error) {
        next(error);
    }
});
const applicationInput = z.object({ propertyId: z.string().min(1), unit: z.string().trim().min(1), notes: z.string().trim().max(2000).optional() });
router.get("/applications", requireAuth, async (req, res, next) => { try {
    res.json({ data: await applicationRepository.list(req.user) });
}
catch (error) {
    next(error);
} });
router.post("/applications", requireAuth, validate(z.object({ body: applicationInput, params: z.unknown(), query: z.unknown() })), async (req, res, next) => { try {
    await propertyRepository.find(req.body.propertyId);
    res.status(201).json({ data: await applicationRepository.create({ ...req.body, applicantId: req.user.id }) });
}
catch (error) {
    next(error);
} });
router.patch("/applications/:id", requireAuth, requireRoles("ADMIN", "MANAGER", "STAFF"), validate(z.object({ body: z.object({ status: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]), notes: z.string().trim().max(2000).optional() }), params: idParams.shape.params, query: z.unknown() })), async (req, res, next) => { try {
    res.json({ data: await applicationRepository.review(req.params.id, req.user.id, req.body.status, req.body.notes) });
}
catch (error) {
    next(error);
} });
router.get("/conversations", requireAuth, async (req, res, next) => { try {
    res.json({ data: await messagingRepository.list(req.user.id) });
}
catch (error) {
    next(error);
} });
router.post("/conversations", requireAuth, validate(z.object({ body: z.object({ memberIds: z.array(z.string().min(1)).max(50), subject: z.string().trim().max(120).optional(), propertyId: z.string().min(1).optional(), body: z.string().trim().min(1).max(5000) }), params: z.unknown(), query: z.unknown() })), async (req, res, next) => { try {
    res.status(201).json({ data: await messagingRepository.create(req.user.id, req.body) });
}
catch (error) {
    next(error);
} });
router.get("/conversations/:id/messages", requireAuth, validate(idParams), async (req, res, next) => { try {
    res.json({ data: await messagingRepository.messages(req.user.id, req.params.id) });
}
catch (error) {
    next(error);
} });
router.post("/conversations/:id/messages", requireAuth, validate(z.object({ body: z.object({ body: z.string().trim().min(1).max(5000) }), params: idParams.shape.params, query: z.unknown() })), async (req, res, next) => { try {
    res.status(201).json({ data: await messagingRepository.send(req.user.id, req.params.id, req.body.body) });
}
catch (error) {
    next(error);
} });
router.get("/conversations/:id/events", requireAuth, validate(idParams), async (req, res, next) => {
    try {
        await messagingRepository.messages(req.user.id, req.params.id);
        res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
        const unsubscribe = chatTransport.subscribe(req.params.id, (event) => res.write(`data: ${JSON.stringify(event)}\n\n`));
        req.on("close", unsubscribe);
        res.write(": connected\n\n");
    }
    catch (error) {
        next(error);
    }
});
router.get("/analytics/summary", requireAuth, async (_req, res, next) => {
    try {
        if (!persistenceMode || !propertyRepository)
            throw new HttpError(503, "Analytics persistence is not configured");
        const [properties, payments, maintenance, leases] = await Promise.all([propertyRepository.list(), paymentRepository.list(), maintenanceRepository.list(), leaseRepository.list()]);
        const paid = payments.filter((item) => item.status === "PAID").reduce((sum, item) => sum + item.amount, 0);
        res.json({ data: { properties: properties.length, units: properties.reduce((sum, item) => sum + item.units, 0), collected: paid, openMaintenance: maintenance.filter((item) => item.status !== "RESOLVED").length, activeLeases: leases.filter((item) => item.status === "ACTIVE").length } });
    }
    catch (error) {
        next(error);
    }
});
