import type { Maintenance, Payment, Society } from "../types";
import { maintenance, payments, societies } from "./mockData";

export type Role = "ADMIN" | "MANAGER" | "STAFF" | "RESIDENT" | "OWNER";
export interface AuthUser { id: string; email: string; name: string; role: Role }
export interface Lease { id: string; propertyId: string; tenantId: string; unit: string; monthlyRent: number; startsAt: string; endsAt: string; status: string; property?: { name: string }; tenant?: { name: string } }
export interface ApiMember { id: string; unit: string | null; joinedAt: string; user: AuthUser; property: Society }
export interface ApiNotification { id: string; type: string; title: string; body: string; readAt: string | null; createdAt: string }
export interface Application { id: string; unit: string; status: string; notes?: string | null; property?: { name: string }; verification?: { status: string } | null }
export interface AnalyticsSummary { properties: number; units: number; collected: number; openMaintenance: number; activeLeases: number }
export interface Conversation { id: string; subject?: string | null; messages?: Message[] }
export interface Message { id: string; body: string; createdAt: string; sender: { id: string; name: string } }
export interface PaymentCheckout { provider: string; checkoutUrl: string }

export interface SocietyHubApi {
  register(input: { email: string; name: string; password: string }): Promise<{ user: AuthUser; token: string }>;
  login(input: { email: string; password: string }): Promise<{ user: AuthUser; token: string }>;
  logout(): Promise<void>;
  me(): Promise<AuthUser>;
  listSocieties(): Promise<Society[]>;
  listPayments(): Promise<Payment[]>;
  listMaintenance(): Promise<Maintenance[]>;
  listLeases(): Promise<Lease[]>;
  listMembers(): Promise<ApiMember[]>;
  listNotifications(): Promise<ApiNotification[]>;
  markNotificationRead(id: string): Promise<ApiNotification>;
  createLease(input: Omit<Lease, "id" | "status" | "property" | "tenant">): Promise<Lease>;
  listApplications(): Promise<Application[]>;
  createApplication(input: { propertyId: string; unit: string; notes?: string }): Promise<Application>;
  reviewApplication(id: string, input: { status: "UNDER_REVIEW" | "APPROVED" | "REJECTED"; notes?: string }): Promise<Application>;
  listAnalytics(): Promise<AnalyticsSummary>;
  listConversations(): Promise<Conversation[]>;
  listMessages(id: string): Promise<Message[]>;
  sendMessage(id: string, body: string): Promise<Message>;
  beginPaymentCheckout(id: string, returnUrl: string): Promise<PaymentCheckout>;
  subscribeToConversation(id: string, onEvent: (event: unknown) => void): () => void;
}

const configuredApiBase = (import.meta.env.VITE_API_URL ?? "").trim();
const apiBase = (configuredApiBase || (import.meta.env.DEV ? "http://localhost:4000/api/v1" : "")).replace(/\/$/, "");
const tokenKey = "societyhub.access_token";
const userKey = "societyhub.user";
export const authStorage = {
  getToken: () => localStorage.getItem(tokenKey),
  getUser: (): AuthUser | null => { const value = localStorage.getItem(userKey); if (!value) return null; try { return JSON.parse(value) as AuthUser; } catch { localStorage.removeItem(userKey); return null; } },
  set: (session: { token: string; user: AuthUser }) => { localStorage.setItem(tokenKey, session.token); localStorage.setItem(userKey, JSON.stringify(session.user)); },
  clear: () => { localStorage.removeItem(tokenKey); localStorage.removeItem(userKey); },
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!apiBase) throw new Error("API_URL_NOT_CONFIGURED: set VITE_API_URL to the API base URL");
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = authStorage.getToken();
  if (token) headers.set("Authorization", "Bearer " + token);
  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({})) as { data?: T; error?: { message?: string } };
  if (response.status === 401) { authStorage.clear(); window.dispatchEvent(new Event("societyhub:auth-expired")); }
  if (!response.ok) throw new Error(payload.error?.message ?? `API request failed (${response.status})`);
  return payload.data as T;
}
const remote = <T>(path: string, options?: RequestInit) => request<T>(path, options);

export const api: SocietyHubApi = {
  register: (input) => remote("/auth/register", { method: "POST", body: JSON.stringify(input) }),
  login: (input) => remote("/auth/login", { method: "POST", body: JSON.stringify(input) }),
  logout: async () => { if (authStorage.getToken()) await remote("/auth/logout", { method: "POST" }); authStorage.clear(); },
  me: () => remote("/auth/me"),
  async listSocieties() {
    try {
      const items = await remote<Array<{ id: string; name: string; address: string; units: number; occupancy?: number; collection?: number; accent?: string }>>("/properties");
      return items.map((item, index) => {
        const fallback = societies.find((society) => society.name.toLowerCase() === item.name.toLowerCase());
        return { ...item, occupancy: item.occupancy ?? fallback?.occupancy ?? 0, collection: item.collection ?? fallback?.collection ?? 0, accent: item.accent ?? fallback?.accent ?? ["#5969f2", "#ef9c61", "#50b89b"][index % 3] };
      });
    }
    catch (error) { if (import.meta.env.DEV) return societies; throw error; }
  },
  async listPayments() { return (await remote<Array<{ id: string; amount: number; dueDate: string; status: string; payer?: { name: string }; property?: { name: string }; lease?: { unit: string } }>>("/payments")).map((p) => ({ id: p.id, tenant: p.payer?.name ?? "Resident", unit: p.lease?.unit ?? "-", society: p.property?.name ?? "-", amount: p.amount, date: p.dueDate.slice(0, 10), status: ({ PAID: "Paid", PENDING: "Pending", OVERDUE: "Overdue", FAILED: "Pending" }[p.status] ?? "Pending") as Payment["status"], initials: (p.payer?.name ?? "R").split(" ").map((part) => part[0]).join("").slice(0, 2) })); },
  async listMaintenance() { try { return await remote<Maintenance[]>("/maintenance"); } catch (error) { if (import.meta.env.DEV) return maintenance; throw error; } },
  listLeases: () => remote("/leases"),
  listMembers: () => remote("/members"),
  listNotifications: () => remote("/notifications"),
  markNotificationRead: (id) => remote(`/notifications/${id}/read`, { method: "PATCH" }),
  createLease: (input) => remote("/leases", { method: "POST", body: JSON.stringify(input) }),
  listApplications: () => remote("/applications"),
  createApplication: (input) => remote("/applications", { method: "POST", body: JSON.stringify(input) }),
  reviewApplication: (id, input) => remote(`/applications/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
  listAnalytics: () => remote("/analytics/summary"),
  listConversations: () => remote("/conversations"),
  listMessages: (id) => remote(`/conversations/${id}/messages`),
  sendMessage: (id, body) => remote(`/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) }),
  beginPaymentCheckout: (id, returnUrl) => remote(`/payments/${id}/checkout`, { method: "POST", body: JSON.stringify({ returnUrl }) }),
  subscribeToConversation: (id, onEvent) => {
    // EventSource cannot attach the bearer token; polling is the safe development
    // fallback until the deployment supplies an authenticated WebSocket transport.
    let active = true;
    const poll = async () => { if (active) { await remote(`/conversations/${id}/messages`).then(() => onEvent({ type: "messages.updated" })).catch(() => undefined); } };
    const timer = window.setInterval(() => { void poll(); }, 5000);
    return () => { active = false; window.clearInterval(timer); };
  },
};
