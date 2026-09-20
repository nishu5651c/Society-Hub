import { HttpError } from "./errors.js";
const now = () => new Date().toISOString();
const randomId = () => `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
export const store = {
    properties: [{ id: "s1", name: "The Ferns", address: "Bandra West, Mumbai", units: 128, createdAt: now() }],
    maintenance: [],
    createProperty(input) {
        const item = { ...input, id: randomId(), createdAt: now() };
        this.properties.push(item);
        return item;
    },
    createMaintenance(input) {
        const item = { ...input, id: randomId(), status: "OPEN", createdAt: now() };
        this.maintenance.push(item);
        return item;
    },
    findProperty(id) {
        const item = this.properties.find((property) => property.id === id);
        if (!item)
            throw new HttpError(404, "Property not found");
        return item;
    },
};
