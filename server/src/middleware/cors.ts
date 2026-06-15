import cors from "cors";
import type { Env } from "../config/env.js";

/**
 * Build a matcher for each configured origin. Exact strings match exactly;
 * entries containing `*` become subdomain wildcards (e.g.
 * `https://shutterdesk-*.vercel.app` matches Vercel preview deployments).
 */
function buildOriginMatchers(value: string): Array<(origin: string) => boolean> {
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((pattern) => {
      if (!pattern.includes("*")) {
        return (origin: string) => origin === pattern;
      }

      const regex = new RegExp(
        "^" +
          pattern
            .replace(/[.+?^${}()|[\]\\]/g, "\\$&") // escape regex specials
            .replace(/\*/g, "[^.]*") + // `*` matches within a single label
          "$",
      );
      return (origin: string) => regex.test(origin);
    });
}

export function createCorsMiddleware(env: Env) {
  const originMatchers = buildOriginMatchers(env.CORS_ORIGIN);

  return cors({
    origin(origin, callback) {
      // Allow non-browser clients (health checks, curl) and same-origin requests.
      if (!origin || originMatchers.some((matches) => matches(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}
