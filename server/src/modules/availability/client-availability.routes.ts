import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatZodErrors } from "../../lib/format-zod-errors.js";
import {
  createAuthMiddleware,
  requireRole,
} from "../../middleware/auth.js";
import {
  getClientAvailabilityDates,
  getClientAvailabilitySlots,
} from "./availability.service.js";

const datesQuerySchema = z.object({
  studioSlug: z.string().min(1),
  packageId: z.string().uuid(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

const slotsQuerySchema = z.object({
  studioSlug: z.string().min(1),
  packageId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});


export function createClientAvailabilityRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/dates", async (req, res, next) => {
    try {
      const parsed = datesQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const data = await getClientAvailabilityDates(
        parsed.data.studioSlug,
        parsed.data.packageId,
        parsed.data.month,
        parsed.data.year,
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.get("/slots", async (req, res, next) => {
    try {
      const parsed = slotsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const data = await getClientAvailabilitySlots(
        parsed.data.studioSlug,
        parsed.data.packageId,
        parsed.data.date,
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
