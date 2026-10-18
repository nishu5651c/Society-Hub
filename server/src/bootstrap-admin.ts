import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db.js";

const input = z
  .object({
    BOOTSTRAP_ADMIN_EMAIL: z.string().trim().email(),
    BOOTSTRAP_ADMIN_NAME: z.string().trim().min(2),
    BOOTSTRAP_ADMIN_PASSWORD: z.string().min(12),
  })
  .safeParse(process.env);

if (!input.success) {
  throw new Error(
    "Set a valid bootstrap admin email, name, and password (at least 12 characters)",
  );
}
if (!prisma) {
  throw new Error(
    "DATABASE_URL is required to bootstrap the production administrator",
  );
}

try {
  const {
    BOOTSTRAP_ADMIN_EMAIL,
    BOOTSTRAP_ADMIN_NAME,
    BOOTSTRAP_ADMIN_PASSWORD,
  } = input.data;
  await prisma.$transaction(
    async (transaction) => {
      const existingAdmins = await transaction.user.count({
        where: { role: "ADMIN" },
      });
      if (existingAdmins > 0) {
        throw new Error(
          "An administrator already exists; bootstrap is allowed only on an empty admin roster",
        );
      }
      const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);
      await transaction.user.create({
        data: {
          email: BOOTSTRAP_ADMIN_EMAIL.toLowerCase(),
          name: BOOTSTRAP_ADMIN_NAME,
          passwordHash,
          role: "ADMIN",
        },
      });
    },
    { isolationLevel: "Serializable" },
  );
  console.info(
    `Bootstrapped production administrator ${BOOTSTRAP_ADMIN_EMAIL.toLowerCase()}`,
  );
} finally {
  await prisma.$disconnect();
}
