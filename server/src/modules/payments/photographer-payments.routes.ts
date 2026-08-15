import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatZodErrors } from "../../lib/format-zod-errors.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import {
  listPhotographerVerifications,
  requestReceiptResubmission,
  updateVerificationStatus,
} from "./payments.service.js";

const updateStatusSchema = z.object({
  status: z.enum(["approved", "rejected"]),
});


export function createPhotographerPaymentsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/verifications", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const verifications = await listPhotographerVerifications(userId);
      res.json({ data: verifications });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/verifications/:id", async (req, res, next) => {
    try {
      const parsed = updateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const verification = await updateVerificationStatus(
        userId,
        req.params.id,
        parsed.data.status,
      );
      res.json({ data: verification });
    } catch (error) {
      next(error);
    }
  });

  router.post("/verifications/:id/request-resubmission", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const verification = await requestReceiptResubmission(userId, req.params.id);
      res.json({ data: verification });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
