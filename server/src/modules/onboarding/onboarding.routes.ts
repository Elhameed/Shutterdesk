import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
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

  router.post("/complete", async (req, res) => {
    const input = parseBody(req, completeSchema);
    const { userId } = authContext(req);
    const result = await completePhotographerOnboarding(userId, input);
    res.status(201).json({ data: result });
  });

  router.post("/skip", async (req, res) => {
    const input = parseBody(req, skipSchema);
    const { userId } = authContext(req);
    const result = await skipPhotographerOnboarding(userId, input);
    res.json({ data: result });
  });

  return router;
}

export function createClientOnboardingRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.post("/skip", async (req, res) => {
    const { userId } = authContext(req);
    const result = await skipClientOnboarding(userId);
    res.json({ data: result });
  });

  return router;
}
