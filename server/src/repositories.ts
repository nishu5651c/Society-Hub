import { prisma } from "./db.js";
import { HttpError } from "./errors.js";
import { store } from "./store.js";
import { chatTransport } from "./providers.js";

export const propertyRepository = {
  async list() {
    return prisma ? prisma.property.findMany({ orderBy: { createdAt: "desc" } }) : store.properties;
  },
  async find(id: string) {
    if (prisma) {
      const result = await prisma.property.findUnique({ where: { id } });
      if (!result) throw new HttpError(404, "Property not found");
      return result;
    }
    return store.findProperty(id);
  },
  async create(input: { name: string; address: string; units: number }) {
    return prisma ? prisma.property.create({ data: input }) : store.createProperty(input);
  },
};

export const maintenanceRepository = {
  async list(user?: { id: string; role: UserRecord["role"] }) {
    const where = user && ["RESIDENT", "OWNER"].includes(user.role) ? { reporterId: user.id } : undefined;
    return prisma ? prisma.maintenance.findMany({ where, orderBy: { createdAt: "desc" } }) : store.maintenance;
  },
  async create(input: { propertyId: string; title: string; location: string; priority: "LOW" | "MEDIUM" | "HIGH"; reporterId?: string }) {
    return prisma
      ? prisma.maintenance.create({ data: { ...input, reporterId: input.reporterId ?? null } })
      : store.createMaintenance(input);
  },
};

export const leaseRepository = {
  async list(user?: { id: string; role: UserRecord["role"] }) {
    if (prisma) {
      return prisma.lease.findMany({
        where: user && ["RESIDENT", "OWNER"].includes(user.role) ? { tenantId: user.id } : undefined,
        include: { property: true, tenant: { select: { id: true, name: true, email: true } } },
        orderBy: { endsAt: "asc" },
      });
    }
    return [];
  },
  async create(input: { propertyId: string; tenantId: string; unit: string; monthlyRent: number; startsAt: Date; endsAt: Date }) {
    if (prisma) return prisma.lease.create({ data: input, include: { property: true, tenant: { select: { id: true, name: true, email: true } } } });
    throw new HttpError(503, "Lease persistence is not configured");
  },
};

export const paymentRepository = {
  async list(user?: { id: string; role: UserRecord["role"] }) {
    if (prisma) {
      return prisma.payment.findMany({
        where: user && ["RESIDENT", "OWNER"].includes(user.role) ? { payerId: user.id } : undefined,
        include: { property: true, lease: true, payer: { select: { id: true, name: true, email: true } } },
        orderBy: { dueDate: "desc" },
      });
    }
    return [];
  },
  async create(input: { propertyId: string; leaseId?: string; payerId: string; amount: number; dueDate: Date; status?: "PENDING" | "PAID" | "OVERDUE" | "FAILED"; paidAt?: Date }) {
    if (prisma) {
      const status = input.status ?? "PENDING";
      return prisma.payment.create({
        data: { ...input, leaseId: input.leaseId ?? null, status, paidAt: status === "PAID" ? (input.paidAt ?? new Date()) : null },
        include: { property: true, lease: true },
      });
    }
    throw new HttpError(503, "Payment persistence is not configured");
  },
};

export const memberRepository = {
  async list(user?: { id: string; role: UserRecord["role"] }) {
    if (prisma) {
      return prisma.member.findMany({
        where: user && ["RESIDENT", "OWNER"].includes(user.role) ? { userId: user.id } : undefined,
        include: { user: { select: { id: true, name: true, email: true, role: true } }, property: true },
        orderBy: { joinedAt: "desc" },
      });
    }
    return [];
  },
  async create(input: { userId: string; propertyId: string; unit?: string }) {
    if (prisma) return prisma.member.create({ data: { ...input, unit: input.unit ?? null }, include: { user: { select: { id: true, name: true, email: true, role: true } }, property: true } });
    throw new HttpError(503, "Member persistence is not configured");
  },
};

export const notificationRepository = {
  async list(userId: string) {
    return prisma ? prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }) : [];
  },
  async markRead(userId: string, id: string) {
    if (!prisma) throw new HttpError(503, "Notification persistence is not configured");
    const result = await prisma.notification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
    if (!result.count) throw new HttpError(404, "Notification not found");
    return prisma.notification.findUnique({ where: { id } });
  },
};

export const applicationRepository = {
  async list(user: { id: string; role: UserRecord["role"] }) {
    if (!prisma) return [];
    const where = ["ADMIN", "MANAGER", "STAFF"].includes(user.role) ? {} : { applicantId: user.id };
    return prisma.application.findMany({ where, include: { property: true, applicant: { select: { id: true, name: true, email: true } }, verification: true }, orderBy: { createdAt: "desc" } });
  },
  async create(input: { propertyId: string; applicantId: string; unit: string; notes?: string }) {
    if (!prisma) throw new HttpError(503, "Application persistence is not configured");
    return prisma.application.create({ data: { ...input, notes: input.notes ?? null }, include: { property: true, verification: true } });
  },
  async review(id: string, reviewerId: string, status: "UNDER_REVIEW" | "APPROVED" | "REJECTED", notes?: string) {
    if (!prisma) throw new HttpError(503, "Application persistence is not configured");
    const result = await prisma.application.updateMany({ where: { id }, data: { status, reviewerId, ...(notes === undefined ? {} : { notes }) } });
    if (!result.count) throw new HttpError(404, "Application not found");
    return prisma.application.findUnique({ where: { id }, include: { verification: true } });
  },
};

export const messagingRepository = {
  async list(userId: string) {
    if (!prisma) return [];
    return prisma.conversation.findMany({ where: { members: { some: { userId } } }, include: { members: { include: { user: { select: { id: true, name: true } } } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } }, orderBy: { updatedAt: "desc" } });
  },
  async create(userId: string, input: { memberIds: string[]; subject?: string; propertyId?: string; body: string }) {
    if (!prisma) throw new HttpError(503, "Messaging persistence is not configured");
    const memberIds = [...new Set([userId, ...input.memberIds])];
    return prisma.conversation.create({ data: { subject: input.subject, propertyId: input.propertyId, members: { create: memberIds.map((id) => ({ userId: id })) }, messages: { create: { senderId: userId, body: input.body } } }, include: { messages: true, members: true } });
  },
  async messages(userId: string, conversationId: string) {
    if (!prisma) return [];
    const member = await prisma.conversationMember.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
    if (!member) throw new HttpError(404, "Conversation not found");
    return prisma.message.findMany({ where: { conversationId }, include: { sender: { select: { id: true, name: true } } }, orderBy: { createdAt: "asc" } });
  },
  async send(userId: string, conversationId: string, body: string) {
    if (!prisma) throw new HttpError(503, "Messaging persistence is not configured");
    const member = await prisma.conversationMember.findUnique({ where: { conversationId_userId: { conversationId, userId } } });
    if (!member) throw new HttpError(404, "Conversation not found");
    const message = await prisma.message.create({ data: { conversationId, senderId: userId, body }, include: { sender: { select: { id: true, name: true } } } });
    await chatTransport.publish(conversationId, { type: "message.created", messageId: message.id });
    return message;
  },
};

export type UserRecord = { id: string; email: string; name: string; role: "ADMIN" | "MANAGER" | "STAFF" | "RESIDENT" | "OWNER"; passwordHash: string };
const users: UserRecord[] = [];
export const userRepository = {
  async findByEmail(email: string) {
    return prisma ? prisma.user.findUnique({ where: { email } }) : users.find((user) => user.email === email) ?? null;
  },
  async findById(id: string) {
    return prisma ? prisma.user.findUnique({ where: { id } }) : users.find((user) => user.id === id) ?? null;
  },
  async create(input: { email: string; name: string; passwordHash: string; role?: UserRecord["role"] }) {
    if (prisma) return prisma.user.create({ data: { ...input, role: input.role ?? "RESIDENT" } });
    const user = { ...input, role: input.role ?? "RESIDENT", id: `mock_user_${Date.now()}` };
    users.push(user);
    return user;
  },
};
