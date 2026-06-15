import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot-reloads (tsx watch) and test files.
// Creating a new client per reload leaks connections and adds cold-connection
// latency to the first query after every restart.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
