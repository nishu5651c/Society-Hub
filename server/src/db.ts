import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from "./config.js";

export const prisma = config.databaseUrl
  ? new PrismaClient({ adapter: new PrismaPg(config.databaseUrl) })
  : null;
export const persistenceMode = prisma ? "postgres" : "development-fallback";
