import type { ApplicationRecord, DashboardMetric, MaintenanceItem, MessageThread, PaymentItem, Property } from "../types";

export const properties: Property[] = [
  {
    id: "p-1",
    title: "Skyline Heights",
    location: "Banjara Hills, Hyderabad",
    bhk: "3 BHK",
    area: "1560 sq ft",
    rent: 52000,
    deposit: 95000,
    occupancy: 92,
    status: "Available",
    accent: "linear-gradient(135deg, #7c9cff, #8ed6ff)",
    amenities: ["Parking", "Lift", "Security", "Gym", "CCTV", "Balcony"],
  },
  {
    id: "p-2",
    title: "Aster Residency",
    location: "Whitefield, Bengaluru",
    bhk: "2 BHK",
    area: "1185 sq ft",
    rent: 39000,
    deposit: 82000,
    occupancy: 87,
    status: "Available",
    accent: "linear-gradient(135deg, #2ec5a8, #5ce3c6)",
    amenities: ["Parking", "Power backup", "Clubhouse", "Garden", "WiFi"],
  },
  {
    id: "p-3",
    title: "Oak View Gardens",
    location: "Kharadi, Pune",
    bhk: "4 BHK",
    area: "2125 sq ft",
    rent: 76000,
    deposit: 145000,
    occupancy: 96,
    status: "Occupied",
    accent: "linear-gradient(135deg, #ff9f6e, #ffd28d)",
    amenities: ["Parking", "Swimming pool", "Security", "Lift", "Gym"],
  },
  {
    id: "p-4",
    title: "Horizon Court",
    location: "Koramangala, Bengaluru",
    bhk: "1 BHK",
    area: "715 sq ft",
    rent: 29000,
    deposit: 65000,
    occupancy: 83,
    status: "Available",
    accent: "linear-gradient(135deg, #a98cff, #d2bbff)",
    amenities: ["WiFi", "CCTV", "Power backup", "Security", "Balcony"],
  },
];

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Portfolio value", value: "₹4.8 Cr", change: "+12.4%", note: "YoY growth" },
  { label: "Rent collected", value: "₹42.8L", change: "+8.2%", note: "This month" },
  { label: "Occupancy", value: "94.2%", change: "+2.1%", note: "Across all towers" },
  { label: "Open issues", value: "19", change: "-6.3%", note: "Resolved faster" },
];

export const payments: PaymentItem[] = [
  { id: "pay-1", tenant: "Aarav Mehta", flat: "B-1204", due: "Today", amount: 38500, status: "Paid" },
  { id: "pay-2", tenant: "Sana Kapoor", flat: "A-604", due: "2 days", amount: 42000, status: "Paid" },
  { id: "pay-3", tenant: "Rohan Desai", flat: "C-302", due: "4 days", amount: 27500, status: "Pending" },
  { id: "pay-4", tenant: "Nisha Iyer", flat: "A-1102", due: "Overdue", amount: 36000, status: "Pending" },
];

export const maintenanceItems: MaintenanceItem[] = [
  { id: "maint-1", title: "Low water pressure", location: "Tower B · B-1204", category: "Water", requestedBy: "Aarav Mehta", date: "Today", status: "Open" },
  { id: "maint-2", title: "Gym treadmill inspection", location: "Clubhouse · Level 2", category: "Fitness", requestedBy: "Society ops", date: "Today", status: "In progress" },
  { id: "maint-3", title: "Corridor lighting repair", location: "Tower A · 7th floor", category: "Electrical", requestedBy: "Nisha Iyer", date: "Yesterday", status: "Resolved" },
  { id: "maint-4", title: "Parking gate sensor", location: "Basement · Entry", category: "Security", requestedBy: "Security desk", date: "Yesterday", status: "Open" },
];

export const applications: ApplicationRecord[] = [
  { id: "app-1", name: "Meher Nair", property: "Skyline Heights", status: "Under review", moveIn: "12 Aug 2026" },
  { id: "app-2", name: "Kabir Shah", property: "Aster Residency", status: "Approved", moveIn: "01 Sep 2026" },
  { id: "app-3", name: "Tanvi Sethi", property: "Horizon Court", status: "Pending", moveIn: "18 Sep 2026" },
];

export const messages: MessageThread[] = [
  { id: "msg-1", name: "Priya Menon", preview: "We can schedule the visit for Saturday morning.", time: "2m ago" },
  { id: "msg-2", name: "Rahul Shah", preview: "Thanks, the agreement copy is shared.", time: "18m ago" },
  { id: "msg-3", name: "Operations Team", preview: "Payment reminder sent to 3 tenants today.", time: "1h ago" },
];

