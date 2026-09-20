import { HttpError } from "./errors.js";

export type Property = { id: string; name: string; address: string; units: number; createdAt: string };
export type Maintenance = { id: string; propertyId: string; title: string; location: string; priority: "LOW" | "MEDIUM" | "HIGH"; status: "OPEN" | "IN_PROGRESS" | "RESOLVED"; createdAt: string };
const now = () => new Date().toISOString();
const randomId = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const store = {
  properties: [{ id: "s1", name: "The Ferns", address: "Bandra West, Mumbai", units: 128, createdAt: now() }] as Property[],
  maintenance: [] as Maintenance[],
  createProperty(input: Omit<Property, "id" | "createdAt">) {
    const item = { ...input, id: randomId(), createdAt: now() };
    this.properties.push(item);
    return item;
  },
  createMaintenance(input: Omit<Maintenance, "id" | "createdAt" | "status">) {
    const item = { ...input, id: randomId(), status: "OPEN" as const, createdAt: now() };
    this.maintenance.push(item);
    return item;
  },
  findProperty(id: string) {
    const item = this.properties.find((property) => property.id === id);
    if (!item) throw new HttpError(404, "Property not found");
    return item;
  },
};
