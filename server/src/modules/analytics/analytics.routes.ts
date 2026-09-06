import { Router } from "express";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { getPhotographerAnalytics } from "./analytics.service.js";

export function createPhotographerAnalyticsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const range = typeof req.query.range === "string" ? req.query.range : undefined;
    const data = await getPhotographerAnalytics(userId, range);
    res.json({ data });
  });

  return router;
}
