import { Router } from "express";
import type { Env } from "../../config/env.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import { getPhotographerAnalytics } from "./analytics.service.js";

export function createPhotographerAnalyticsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const range =
        typeof req.query.range === "string" ? req.query.range : undefined;
      const data = await getPhotographerAnalytics(userId, range);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
