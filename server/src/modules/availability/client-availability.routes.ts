import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseQuery } from "../../middleware/validate.js";
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

  router.get("/dates", async (req, res) => {
    const { studioSlug, packageId, month, year } = parseQuery(req, datesQuerySchema);
    const data = await getClientAvailabilityDates(studioSlug, packageId, month, year);
    res.json({ data });
  });

  router.get("/slots", async (req, res) => {
    const { studioSlug, packageId, date } = parseQuery(req, slotsQuerySchema);
    const data = await getClientAvailabilitySlots(studioSlug, packageId, date);
    res.json({ data });
  });

  return router;
}
