import { Router } from "express";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { listClientStudios, listClientStudioServices } from "./client-studios.service.js";

export function createClientStudiosRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const studios = await listClientStudios(userId);
    res.json({ data: studios });
  });

  router.get("/:slug/services", async (req, res) => {
    const { userId } = authContext(req);
    const services = await listClientStudioServices(userId, req.params.slug);
    res.json({ data: services });
  });

  return router;
}
