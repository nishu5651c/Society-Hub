export type View = "overview" | "properties" | "rentals" | "payments" | "maintenance" | "members" | "applications" | "messages" | "analytics" | "settings";
export type Status = "Paid" | "Pending" | "Overdue" | "Open" | "In progress" | "Resolved";

export interface Society { id: string; name: string; address: string; units: number; occupancy: number; collection: number; accent: string; }
export interface Payment { id: string; tenant: string; unit: string; society: string; amount: number; date: string; status: Status; initials: string; }
export interface Maintenance { id: string; title: string; location: string; reporter: string; priority: "Low" | "Medium" | "High"; status: Status; created: string; }
