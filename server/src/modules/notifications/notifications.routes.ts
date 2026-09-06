import { Router } from "express";
import type { UserRole } from "@prisma/client";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parsePaginationParams } from "../../lib/pagination.js";
import { respondWithOptionalPagination } from "../../lib/route-pagination.js";
import type { PaginatedResult, PaginationParams } from "../../lib/pagination.js";
import {
  listClientNotifications,
  listPhotographerNotifications,
  markAllClientNotificationsRead,
  markAllPhotographerNotificationsRead,
  markClientNotificationRead,
  markPhotographerNotificationRead,
} from "./notifications.service.js";

type NotificationHandlers<T> = {
  list: (
    userId: string,
    pagination?: PaginationParams,
  ) => Promise<T[] | PaginatedResult<T>>;
  markAllRead: (userId: string) => Promise<unknown>;
  markRead: (userId: string, notificationId: string) => Promise<unknown>;
};

/**
 * Both audiences expose the same three notification routes over different
 * service functions, so they share one router rather than two copies that have
 * to be kept in step.
 */
function createNotificationsRouter<T>(
  env: Env,
  role: UserRole,
  handlers: NotificationHandlers<T>,
) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole(role));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const pagination =
      req.query.page !== undefined
        ? parsePaginationParams(req.query as Record<string, unknown>)
        : undefined;
    const data = await handlers.list(userId, pagination);
    respondWithOptionalPagination(res, data);
  });

  router.patch("/read-all", async (req, res) => {
    const { userId } = authContext(req);
    const data = await handlers.markAllRead(userId);
    res.json({ data });
  });

  router.patch("/:id/read", async (req, res) => {
    const { userId } = authContext(req);
    const data = await handlers.markRead(userId, req.params.id);
    res.json({ data });
  });

  return router;
}

export function createClientNotificationsRouter(env: Env) {
  return createNotificationsRouter(env, "client", {
    list: listClientNotifications,
    markAllRead: markAllClientNotificationsRead,
    markRead: markClientNotificationRead,
  });
}

export function createPhotographerNotificationsRouter(env: Env) {
  return createNotificationsRouter(env, "photographer", {
    list: listPhotographerNotifications,
    markAllRead: markAllPhotographerNotificationsRead,
    markRead: markPhotographerNotificationRead,
  });
}
