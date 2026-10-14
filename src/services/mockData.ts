export type UserRole = "ADMIN" | "MANAGER" | "STAFF" | "RESIDENT" | "OWNER";

export type PropertyStatus = "Available" | "Occupied";

export interface Property {
  id: string;
  title: string;
  location: string;
  bhk: string;
  area: string;
  rent: number;
  deposit: number;
  occupancy: number;
  status: PropertyStatus;
  accent: string;
  amenities: string[];
}

export interface PaymentItem {
  id: string;
  tenant: string;
  flat: string;
  due: string;
  amount: number;
  status: "Paid" | "Pending";
}

export interface MaintenanceItem {
  id: string;
  title: string;
  location: string;
  category: string;
  requestedBy: string;
  date: string;
  status: "Open" | "In progress" | "Resolved";
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  note: string;
}

export interface MessageThread {
  id: string;
  name: string;
  preview: string;
  time: string;
}

export interface ApplicationRecord {
  id: string;
  name: string;
  property: string;
  status: "Approved" | "Under review" | "Pending";
  moveIn: string;
}
