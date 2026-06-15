import type { Env } from "../config/env.js";
import { logger } from "./logger.js";

let sentryEnabled = false;

export function initMonitoring(env: Env) {
  const dsn = env.SENTRY_DSN;
  if (!dsn || env.NODE_ENV === "test") {
    logger.info("monitoring_disabled");
    return;
  }

  void import("@sentry/node")
    .then((Sentry) => {
      Sentry.init({
        dsn,
        environment: env.NODE_ENV,
        tracesSampleRate: env.NODE_ENV === "production" ? 0.1 : 1,
      });
      sentryEnabled = true;
      logger.info("monitoring_enabled", { provider: "sentry" });
    })
    .catch(() => {
      logger.warn("monitoring_sentry_unavailable");
    });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  logger.error("captured_exception", {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  if (!sentryEnabled) {
    return;
  }

  void import("@sentry/node")
    .then((Sentry) => {
      Sentry.captureException(error, { extra: context });
    })
    .catch(() => {
      // Sentry init failed — structured logs remain the source of truth.
    });
}
