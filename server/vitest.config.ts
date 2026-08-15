import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "vitest/config";

// Load an isolated test environment BEFORE anything else so the test suite never
// touches the development/production database configured in server/.env.
// `override: true` ensures values here win over any pre-existing shell/.env vars.
const testDir = path.dirname(fileURLToPath(import.meta.url));
const testEnvPath = path.resolve(testDir, ".env.test");
if (existsSync(testEnvPath)) {
  config({ path: testEnvPath, override: true });
}

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
    fileParallelism: false,
    hookTimeout: 60_000,
  },
});
