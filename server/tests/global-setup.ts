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
}
