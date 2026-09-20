import type { Maintenance, Payment, Society } from "../types";

export const societies: Society[] = [
  { id: "s1", name: "The Ferns", address: "Bandra West, Mumbai", units: 128, occupancy: 94, collection: 97, accent: "#5969f2" },
  { id: "s2", name: "Aster Heights", address: "Hinjewadi, Pune", units: 86, occupancy: 88, collection: 91, accent: "#ef9c61" },
  { id: "s3", name: "Harbor View", address: "Whitefield, Bengaluru", units: 214, occupancy: 96, collection: 94, accent: "#50b89b" },
];

export const payments: Payment[] = [
  { id: "p1", tenant: "Aarav Mehta", unit: "B-1204", society: "The Ferns", amount: 38500, date: "Today, 09:42", status: "Paid", initials: "AM" },
  { id: "p2", tenant: "Sana Kapoor", unit: "A-604", society: "Harbor View", amount: 42000, date: "Today, 08:18", status: "Paid", initials: "SK" },
  { id: "p3", tenant: "Rohan Desai", unit: "C-302", society: "Aster Heights", amount: 27500, date: "Yesterday", status: "Pending", initials: "RD" },
  { id: "p4", tenant: "Nisha Iyer", unit: "A-1102", society: "The Ferns", amount: 36000, date: "Sep 18, 2024", status: "Overdue", initials: "NI" },
  { id: "p5", tenant: "Kabir Shah", unit: "D-803", society: "Harbor View", amount: 46500, date: "Sep 17, 2024", status: "Paid", initials: "KS" },
];

export const maintenance: Maintenance[] = [
  { id: "m1", title: "Water pressure low", location: "Tower B · B-1204", reporter: "Aarav Mehta", priority: "High", status: "Open", created: "24 min ago" },
  { id: "m2", title: "Gym treadmill service", location: "Clubhouse · Level 2", reporter: "SocietyHub team", priority: "Medium", status: "In progress", created: "2 hours ago" },
  { id: "m3", title: "Corridor light replacement", location: "Tower A · 7th floor", reporter: "Nisha Iyer", priority: "Low", status: "Resolved", created: "Yesterday" },
  { id: "m4", title: "Parking gate sensor", location: "Basement · Entry", reporter: "Security desk", priority: "Medium", status: "Open", created: "Yesterday" },
];
