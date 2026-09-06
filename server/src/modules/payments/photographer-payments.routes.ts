import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
import {
  listPhotographerVerifications,
  requestReceiptResubmission,
  updateVerificationStatus,
} from "./payments.service.js";

const updateStatusSchema = z
  .object({ status: z.enum(["approved", "rejected"]) })
  .strict();

export function createPhotographerPaymentsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/verifications", async (req, res) => {
    const { userId } = authContext(req);
    const verifications = await listPhotographerVerifications(userId);
    res.json({ data: verifications });
  });

  router.patch("/verifications/:id", async (req, res) => {
    const { status } = parseBody(req, updateStatusSchema);
    const { userId } = authContext(req);
    const verification = await updateVerificationStatus(userId, req.params.id, status);
    res.json({ data: verification });
  });

  router.post("/verifications/:id/request-resubmission", async (req, res) => {
    const { userId } = authContext(req);
    const verification = await requestReceiptResubmission(userId, req.params.id);
    res.json({ data: verification });
  });

  return router;
}
