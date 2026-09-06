import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseQuery } from "../../middleware/validate.js";
import { getPhotographerCalendar } from "./calendar.service.js";

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export function createPhotographerCalendarRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res) => {
    const { month, year } = parseQuery(req, querySchema);
    const { userId } = authContext(req);
    const data = await getPhotographerCalendar(userId, month, year);
    res.json({ data });
  });

  return router;
}
