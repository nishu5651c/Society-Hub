import { persistenceMode } from "./db.js";
import { userRepository, propertyRepository } from "./repositories.js";
import { hashPassword } from "./auth.js";

export async function seedDevelopment() {
  if (persistenceMode !== "development-fallback") return;

  const demoUsers = [
    { email: "superadmin@example.com", name: "Super Admin", role: "ADMIN", password: "SuperAdmin123!" },
    { email: "admin@example.com", name: "Society Admin", role: "MANAGER", password: "SocietyAdmin123!" },
    { email: "owner@example.com", name: "Property Owner", role: "OWNER", password: "Owner123!" },
    { email: "staff@example.com", name: "Maintenance Staff", role: "STAFF", password: "Staff123!" },
    { email: "tenant@example.com", name: "Tenant User", role: "RESIDENT", password: "Tenant123!" },
    { email: "resident@example.com", name: "Resident User", role: "RESIDENT", password: "Resident123!" },
  ];

  for (const u of demoUsers) {
    const exists = await userRepository.findByEmail(u.email);
    if (!exists) {
      // passwordHash required by repository.create
      const hash = await hashPassword(u.password);
      await userRepository.create({ email: u.email, name: u.name, passwordHash: hash, role: u.role });
      console.info(`seed: created demo user ${u.email}`);
    }
  }

  const existing = await propertyRepository.list();
  if (!existing || existing.length === 0) {
    const props = [
      { name: "Skyline Heights", address: "Banjara Hills, Hyderabad", units: 128 },
      { name: "Aster Residency", address: "Whitefield, Bengaluru", units: 86 },
      { name: "Oak View Gardens", address: "Kharadi, Pune", units: 214 },
    ];
    for (const p of props) {
      await propertyRepository.create(p as any);
      console.info(`seed: created property ${p.name}`);
    }
  }
}
