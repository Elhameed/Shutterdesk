import { Router } from "express";
import type { Env } from "../../config/env.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import { getPhotographerDashboard } from "./photographer-dashboard.service.js";
import { listPhotographerActivities } from "./photographer-activity.service.js";
import { getClientDashboard } from "./client-dashboard.service.js";
import { parsePaginationParams } from "../../lib/pagination.js";
import {
  PHOTOGRAPHER_ACTIVITY_TYPES,
  type PhotographerActivityType,
} from "../../lib/photographer-activity.js";

export function createPhotographerDashboardRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await getPhotographerDashboard(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/activity", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const pagination = parsePaginationParams(req.query as Record<string, unknown>);
      const rawType = typeof req.query.type === "string" ? req.query.type : undefined;
      const type = PHOTOGRAPHER_ACTIVITY_TYPES.includes(rawType as PhotographerActivityType)
        ? (rawType as PhotographerActivityType)
        : undefined;
      const range = typeof req.query.range === "string" ? req.query.range : undefined;
      const data = await listPhotographerActivities(userId, pagination, { type, range });
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createClientDashboardRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await getClientDashboard(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
