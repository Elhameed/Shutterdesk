import { Router } from "express";
import type { Env } from "../../config/env.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import { parsePaginationParams } from "../../lib/pagination.js";
import { respondWithOptionalPagination } from "../../lib/route-pagination.js";
import {
  listClientNotifications,
  listPhotographerNotifications,
  markAllClientNotificationsRead,
  markAllPhotographerNotificationsRead,
  markClientNotificationRead,
  markPhotographerNotificationRead,
} from "./notifications.service.js";

export function createClientNotificationsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const pagination =
        req.query.page !== undefined
          ? parsePaginationParams(req.query as Record<string, unknown>)
          : undefined;
      const data = await listClientNotifications(userId, pagination);
      respondWithOptionalPagination(res, data);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/read-all", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await markAllClientNotificationsRead(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/read", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await markClientNotificationRead(userId, req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createPhotographerNotificationsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const pagination =
        req.query.page !== undefined
          ? parsePaginationParams(req.query as Record<string, unknown>)
          : undefined;
      const data = await listPhotographerNotifications(userId, pagination);
      respondWithOptionalPagination(res, data);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/read-all", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await markAllPhotographerNotificationsRead(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/read", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await markPhotographerNotificationRead(userId, req.params.id);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
