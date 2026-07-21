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
  blockPhotographerDay,
  createPhotographerBlock,
  deletePhotographerBlock,
  getPhotographerSchedule,
  unblockPhotographerDay,
  updatePhotographerSchedule,
} from "./availability.service.js";

const scheduleSchema = z.object({
  timezone: z.string().optional(),
  weeklyRules: z.array(z.unknown()).optional(),
  slotIntervalMinutes: z.number().int().min(15).max(120).optional(),
  bufferMinutes: z.number().int().min(0).max(120).optional(),
  minNoticeHours: z.number().int().min(0).max(168).optional(),
  maxDaysAhead: z.number().int().min(1).max(365).optional(),
  maxSessionsPerDay: z.number().int().min(1).max(20).optional(),
  requireApproval: z.boolean().optional(),
});

const blockSchema = z.object({
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  reason: z.string().optional(),
});

const blockDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional(),
});


export function createPhotographerAvailabilityRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/schedule", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await getPhotographerSchedule(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/schedule", async (req, res, next) => {
    try {
      const parsed = scheduleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const schedule = await updatePhotographerSchedule(userId, parsed.data);
      res.json({ data: schedule });
    } catch (error) {
      next(error);
    }
  });

  router.post("/blocks", async (req, res, next) => {
    try {
      const parsed = blockSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const block = await createPhotographerBlock(userId, parsed.data);
      res.status(201).json({ data: block });
    } catch (error) {
      next(error);
    }
  });

  router.post("/blocks/day", async (req, res, next) => {
    try {
      const parsed = blockDaySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const block = await blockPhotographerDay(
        userId,
        parsed.data.date,
        parsed.data.reason,
      );
      res.status(201).json({ data: block });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/blocks/day", async (req, res, next) => {
    try {
      const parsed = blockDaySchema.safeParse({ date: req.query.date });
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      await unblockPhotographerDay(userId, parsed.data.date);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  router.delete("/blocks/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      await deletePhotographerBlock(userId, req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
