import express from "express";
import helmet from "helmet";
import type { Env } from "./config/env.js";
import { createCorsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { requestLogger } from "./middleware/request-logger.js";
import { logger } from "./lib/logger.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createClientBookingsRouter } from "./modules/bookings/client-bookings.routes.js";
import { createPhotographerBookingsRouter } from "./modules/bookings/photographer-bookings.routes.js";
import { createPhotographerClientsRouter } from "./modules/clients/clients.routes.js";
import { createClientGalleriesRouter } from "./modules/galleries/client-galleries.routes.js";
import {
  createPhotographerGalleriesRouter,
} from "./modules/galleries/photographer-galleries.routes.js";
import {
  createClientUploadsRouter,
  createPhotographerUploadsRouter,
} from "./modules/uploads/uploads.routes.js";
import { createClientPaymentsRouter } from "./modules/payments/client-payments.routes.js";
import { createPhotographerPaymentsRouter } from "./modules/payments/photographer-payments.routes.js";
import {
  createClientServicesRouter,
  createPhotographerServicesRouter,
} from "./modules/services/services.routes.js";
import { createPhotographerCalendarRouter } from "./modules/calendar/calendar.routes.js";
import {
  createClientDashboardRouter,
  createPhotographerDashboardRouter,
} from "./modules/dashboard/dashboard.routes.js";
import { createPhotographerAnalyticsRouter } from "./modules/analytics/analytics.routes.js";
import { createClientAvailabilityRouter } from "./modules/availability/client-availability.routes.js";
import { createPhotographerAvailabilityRouter } from "./modules/availability/photographer-availability.routes.js";
import {
  createClientNotificationsRouter,
  createPhotographerNotificationsRouter,
} from "./modules/notifications/notifications.routes.js";
import {
  createClientSettingsRouter,
  createPhotographerSettingsRouter,
} from "./modules/settings/settings.routes.js";
import { createClientStudiosRouter } from "./modules/studios/client-studios.routes.js";
import {
  createClientOnboardingRouter,
  createPhotographerOnboardingRouter,
} from "./modules/onboarding/onboarding.routes.js";
import { healthRouter } from "./routes/health.js";

export function createApp(env: Env) {
  const app = express();

  if (env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(createCorsMiddleware(env));
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  logger.info("server_starting", { nodeEnv: env.NODE_ENV });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", createAuthRouter(env));
  app.use("/api/photographer/clients", createPhotographerClientsRouter(env));
  app.use("/api/photographer/bookings", createPhotographerBookingsRouter(env));
  app.use("/api/client/bookings", createClientBookingsRouter(env));
  app.use("/api/client/payments", createClientPaymentsRouter(env));
  app.use("/api/photographer/payments", createPhotographerPaymentsRouter(env));
  app.use("/api/photographer/galleries", createPhotographerGalleriesRouter(env));
  app.use("/api/photographer/uploads", createPhotographerUploadsRouter(env));
  app.use("/api/client/uploads", createClientUploadsRouter(env));
  app.use("/api/client/galleries", createClientGalleriesRouter(env));
  app.use("/api/photographer/services", createPhotographerServicesRouter(env));
  app.use("/api/client/services", createClientServicesRouter(env));
  app.use("/api/photographer/calendar", createPhotographerCalendarRouter(env));
  app.use(
    "/api/photographer/availability",
    createPhotographerAvailabilityRouter(env),
  );
  app.use("/api/client/availability", createClientAvailabilityRouter(env));
  app.use("/api/photographer/dashboard", createPhotographerDashboardRouter(env));
  app.use("/api/client/dashboard", createClientDashboardRouter(env));
  app.use("/api/photographer/analytics", createPhotographerAnalyticsRouter(env));
  app.use(
    "/api/photographer/notifications",
    createPhotographerNotificationsRouter(env),
  );
  app.use("/api/client/notifications", createClientNotificationsRouter(env));
  app.use("/api/photographer/settings", createPhotographerSettingsRouter(env));
  app.use("/api/client/settings", createClientSettingsRouter(env));
  app.use("/api/client/studios", createClientStudiosRouter(env));
  app.use(
    "/api/photographer/onboarding",
    createPhotographerOnboardingRouter(env),
  );
  app.use("/api/client/onboarding", createClientOnboardingRouter(env));

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found", statusCode: 404 });
  });

  app.use(errorHandler);

  return app;
}
