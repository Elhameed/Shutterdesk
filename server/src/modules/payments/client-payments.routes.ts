import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
import { writeRateLimiter } from "../../middleware/rate-limit.js";
import {
  getClientOutstandingSummary,
  getClientPaymentRequest,
  getStudioPaymentProfileBySlug,
  listClientPaymentHistory,
  listClientPaymentRequests,
  uploadClientReceipt,
} from "./payments.service.js";

const uploadReceiptSchema = z.object({
  bookingId: z.string().trim().min(1),
  paymentRequestId: z.string().trim().optional(),
  amount: z.number().int().positive(),
  receiptImage: z.string().trim().min(1),
  paymentOption: z.enum(["deposit", "full"]).optional(),
});


export function createClientPaymentsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const payments = await listClientPaymentHistory(userId);
    res.json({ data: payments });
  });

  router.get("/requests", async (req, res) => {
    const { userId } = authContext(req);
    const requests = await listClientPaymentRequests(userId);
    res.json({ data: requests });
  });

  router.get("/requests/:id", async (req, res) => {
    const { userId } = authContext(req);
    const request = await getClientPaymentRequest(userId, req.params.id);
    if (!request) {
      throw new AppError("Payment request not found", 404);
    }
    res.json({ data: request });
  });

  // `/summary` and `/outstanding` are the same payload under two names; the
  // frontend uses both.
  router.get(["/summary", "/outstanding"], async (req, res) => {
    const { userId } = authContext(req);
    const summary = await getClientOutstandingSummary(userId);
    res.json({ data: summary });
  });

  router.post("/receipts", writeRateLimiter, async (req, res) => {
    const input = parseBody(req, uploadReceiptSchema);
    const { userId } = authContext(req);
    const verification = await uploadClientReceipt(userId, input);
    res.status(201).json({ data: verification });
  });

  router.get("/studios/:slug/profile", async (req, res) => {
    const profile = await getStudioPaymentProfileBySlug(req.params.slug);
    res.json({ data: profile });
  });

  return router;
}
