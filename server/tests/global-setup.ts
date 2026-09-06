import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default async function globalSetup() {
  process.env.NODE_ENV ??= "test";

  // Safety net: never run the destructive integration suite against a shared
  // database by accident. Require either an isolated server/.env.test (loaded by
  // vitest.config.ts) or an explicit CI environment that provisions its own DB.
  const hasTestEnv = existsSync(path.resolve(serverRoot, ".env.test"));
  if (!hasTestEnv && !process.env.CI) {
    throw new Error(
      [
        "Refusing to run tests without an isolated database.",
        "",
        "The suite writes and deletes real records, so it must not run against the",
        "database in server/.env. Create server/.env.test with a dedicated",
        "DATABASE_URL (a local Postgres or a Neon test branch).",
        "",
        "See server/.env.test.example. In CI, set CI=1 and provide DATABASE_URL via",
        "the environment (the GitHub Actions Postgres service already does this).",
      ].join("\n"),
    );
  }

  execSync("npx prisma migrate deploy", {
    cwd: serverRoot,
    stdio: "inherit",
    env: process.env,
  });

  // The suite has no per-test cleanup — isolation comes from uniqueEmail() — so
  // without this every run left its rows behind forever and the database grew
  // without bound, slowing later runs and making manual inspection useless.
  // Truncating once here rather than after the run leaves the last run's data
  // available to look at when something fails.
  await truncateAllTables();
}

async function truncateAllTables() {
  // Imported lazily: importing the Prisma client before `migrate deploy` has run
  // would connect against a schema that may not exist yet.
  const { prisma } = await import("../src/lib/prisma.js");

  try {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
    `;

    if (tables.length === 0) {
      return;
    }

    const list = tables.map(({ tablename }) => `"public"."${tablename}"`).join(", ");
    // booking_reference_seq is standalone rather than owned by a column, so
    // RESTART IDENTITY leaves it alone — which is what we want. It keeps
    // climbing across runs and never reissues a reference.
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
    );
  } finally {
    await prisma.$disconnect();
  }
}
