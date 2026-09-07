import { config } from "dotenv";
import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  // Read by the Prisma CLI (schema.prisma `directUrl`), never by the app.
  // Declared so it is discoverable and not flagged as stray configuration.
  DIRECT_DATABASE_URL: z.string().optional(),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .describe("Comma-separated allowed frontend origins"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER_PREFIX: z.string().default("shutterdesk"),
  SENTRY_DSN: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Read and validate the environment.
 *
 * Memoised because the result cannot change while the process runs, and a
 * handful of leaf helpers call this per request — re-parsing and re-validating
 * every variable each time. Routers still receive `env` by injection; these
 * call sites are deep helpers where threading it through would mean changing
 * several service signatures for no behavioural gain.
 *
 * `resetEnvCache` exists for tests that deliberately swap the environment.
 */
export function loadEnv(): Env {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment configuration:\n${formatted}\n\nCopy server/.env.example to server/.env and fill in the values.`,
    );
  }

  const env = parsed.data;

  if (env.NODE_ENV === "test") {
    cached = {
      ...env,
      CLOUDINARY_CLOUD_NAME: undefined,
      CLOUDINARY_API_KEY: undefined,
      CLOUDINARY_API_SECRET: undefined,
    };
    return cached;
  }

  cached = env;
  return cached;
}

/** Clear the memoised environment. For tests that swap it deliberately. */
export function resetEnvCache(): void {
  cached = null;
}
