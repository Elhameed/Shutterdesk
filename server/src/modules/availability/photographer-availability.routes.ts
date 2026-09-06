import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody, parseQuery } from "../../middleware/validate.js";
import {
  blockPhotographerDay,
  createPhotographerBlock,
  deletePhotographerBlock,
  getPhotographerSchedule,
  unblockPhotographerDay,
  updatePhotographerSchedule,
} from "./availability.service.js";

const scheduleSchema = z
  .object({
    timezone: z.string().optional(),
    weeklyRules: z.array(z.unknown()).optional(),
    slotIntervalMinutes: z.number().int().min(15).max(120).optional(),
    bufferMinutes: z.number().int().min(0).max(120).optional(),
    minNoticeHours: z.number().int().min(0).max(168).optional(),
    maxDaysAhead: z.number().int().min(1).max(365).optional(),
    maxSessionsPerDay: z.number().int().min(1).max(20).optional(),
    requireApproval: z.boolean().optional(),
  })
  .strict();

const blockSchema = z
  .object({
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    reason: z.string().optional(),
  })
  .strict();

const blockDaySchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: z.string().optional(),
  })
  .strict();

/** The delete variant takes the day as a query param rather than a body. */
const unblockDayQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export function createPhotographerAvailabilityRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/schedule", async (req, res) => {
    const { userId } = authContext(req);
    const data = await getPhotographerSchedule(userId);
    res.json({ data });
  });

  router.patch("/schedule", async (req, res) => {
    const input = parseBody(req, scheduleSchema);
    const { userId } = authContext(req);
    const schedule = await updatePhotographerSchedule(userId, input);
    res.json({ data: schedule });
  });

  router.post("/blocks", async (req, res) => {
    const input = parseBody(req, blockSchema);
    const { userId } = authContext(req);
    const block = await createPhotographerBlock(userId, input);
    res.status(201).json({ data: block });
  });

  router.post("/blocks/day", async (req, res) => {
    const { date, reason } = parseBody(req, blockDaySchema);
    const { userId } = authContext(req);
    const block = await blockPhotographerDay(userId, date, reason);
    res.status(201).json({ data: block });
  });

  router.delete("/blocks/day", async (req, res) => {
    const { date } = parseQuery(req, unblockDayQuerySchema);
    const { userId } = authContext(req);
    await unblockPhotographerDay(userId, date);
    res.status(204).send();
  });

  router.delete("/blocks/:id", async (req, res) => {
    const { userId } = authContext(req);
    await deletePhotographerBlock(userId, req.params.id);
    res.status(204).send();
  });

  return router;
}
