import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI configuration.
 *
 * Replaces the `prisma` block in package.json, which Prisma 6 warns about on
 * every command and which is removed in Prisma 7.
 *
 * The dotenv call is load-bearing, not tidiness. Once a prisma.config.ts
 * exists the CLI stops loading .env itself — it prints "Prisma config
 * detected, skipping environment variable loading" — so without this,
 * `prisma migrate` and `prisma db seed` cannot see DATABASE_URL or
 * DIRECT_DATABASE_URL and fail with P1012 on any machine that keeps them in
 * server/.env. Real environment variables (Render, CI) already take
 * precedence, since dotenv does not overwrite what is set.
 *
 * That precedence is what keeps the test suite safe: vitest.config.ts loads
 * .env.test into process.env with `override: true` before global-setup shells
 * out to `prisma migrate deploy`, so the test DATABASE_URL is already set and
 * the dotenv call below cannot replace it with the development one. Verified by
 * running the suite and checking the datasource it reports.
 */
const here = path.dirname(fileURLToPath(import.meta.url));

config({ path: path.join(here, ".env") });

export default defineConfig({
  schema: path.join(here, "prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
