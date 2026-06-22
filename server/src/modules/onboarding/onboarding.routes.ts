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
  completePhotographerOnboarding,
  skipClientOnboarding,
  skipPhotographerOnboarding,
} from "./onboarding.service.js";

const completeSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  specialization: z.string().trim().min(1, "Specialization is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  momoAccountName: z.string().trim().min(1, "MoMo account name is required"),
  momoNumber: z.string().trim().min(1, "MoMo number is required"),
  profilePhotoName: z.string().optional(),
  profilePhotoUrl: z.string().url().optional(),
  qrCodeName: z.string().optional(),
  qrCodeUrl: z.string().url().optional(),
});

const skipSchema = z.object({
  businessName: z.string().trim().optional(),
  specialization: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  momoAccountName: z.string().trim().optional(),
  momoNumber: z.string().trim().optional(),
  profilePhotoName: z.string().optional(),
  profilePhotoUrl: z.string().url().optional(),
  qrCodeName: z.string().optional(),
  qrCodeUrl: z.string().url().optional(),
});


export function createPhotographerOnboardingRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.post("/complete", async (req, res, next) => {
    try {
      const parsed = completeSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as AuthenticatedRequest).auth;
      const result = await completePhotographerOnboarding(userId, parsed.data);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  router.post("/skip", async (req, res, next) => {
    try {
      const parsed = skipSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as AuthenticatedRequest).auth;
      const result = await skipPhotographerOnboarding(userId, parsed.data);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createClientOnboardingRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.post("/skip", async (req, res, next) => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const result = await skipClientOnboarding(userId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
