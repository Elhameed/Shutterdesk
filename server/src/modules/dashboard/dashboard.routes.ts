import { Router } from "express";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { getPhotographerDashboard } from "./photographer-dashboard.service.js";
import { listPhotographerActivities } from "./photographer-activity.service.js";
import { getClientDashboard } from "./client-dashboard.service.js";
import { parsePaginationParams } from "../../lib/pagination.js";
import {
  PHOTOGRAPHER_ACTIVITY_TYPES,
  type PhotographerActivityType,
} from "../../domain/photographer-activity.js";

export function createPhotographerDashboardRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const data = await getPhotographerDashboard(userId);
    res.json({ data });
  });

  router.get("/activity", async (req, res) => {
    const { userId } = authContext(req);
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const rawType = typeof req.query.type === "string" ? req.query.type : undefined;
    const type = PHOTOGRAPHER_ACTIVITY_TYPES.includes(rawType as PhotographerActivityType)
      ? (rawType as PhotographerActivityType)
      : undefined;
    const range = typeof req.query.range === "string" ? req.query.range : undefined;
    const data = await listPhotographerActivities(userId, pagination, { type, range });
    res.json({ data });
  });

  return router;
}

export function createClientDashboardRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const data = await getClientDashboard(userId);
    res.json({ data });
  });

  return router;
}
