import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./db.js";

const email = process.env.DEV_ADMIN_EMAIL ?? "admin@local.societyhub.test";
const password = process.env.DEV_ADMIN_PASSWORD ?? "SocietyHub-dev-2026!";

if (process.env.NODE_ENV === "production") throw new Error("Refusing to run the development admin seed in production");
if (!prisma) throw new Error("DATABASE_URL is required for db:seed:dev");

const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
  where: { email },
  update: { name: "SocietyHub Admin", role: "ADMIN", passwordHash },
  create: { email, name: "SocietyHub Admin", role: "ADMIN", passwordHash },
});

console.log(`Development admin ready: ${user.email}`);
console.log(`Development password: ${password}`);
await prisma.$disconnect();
