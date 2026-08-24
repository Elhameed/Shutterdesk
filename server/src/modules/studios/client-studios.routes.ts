import { Router } from "express";
import type { Env } from "../../config/env.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import { listClientStudios, listClientStudioServices } from "./client-studios.service.js";

export function createClientStudiosRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const studios = await listClientStudios(userId);
      res.json({ data: studios });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:slug/services", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const services = await listClientStudioServices(userId, req.params.slug);
      res.json({ data: services });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

