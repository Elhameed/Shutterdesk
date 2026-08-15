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

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const payments = await listClientPaymentHistory(userId);
      res.json({ data: payments });
    } catch (error) {
      next(error);
    }
  });

  router.get("/requests", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const requests = await listClientPaymentRequests(userId);
      res.json({ data: requests });
    } catch (error) {
      next(error);
    }
  });

  router.get("/requests/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const request = await getClientPaymentRequest(userId, req.params.id);
      if (!request) {
        throw new AppError("Payment request not found", 404);
      }
      res.json({ data: request });
    } catch (error) {
      next(error);
    }
  });

  router.get("/summary", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const summary = await getClientOutstandingSummary(userId);
      res.json({ data: summary });
    } catch (error) {
      next(error);
    }
  });

  router.get("/outstanding", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const summary = await getClientOutstandingSummary(userId);
      res.json({ data: summary });
    } catch (error) {
      next(error);
    }
  });

  router.post("/receipts", writeRateLimiter, async (req, res, next) => {
    try {
      const parsed = uploadReceiptSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const verification = await uploadClientReceipt(userId, parsed.data);
      res.status(201).json({ data: verification });
    } catch (error) {
      next(error);
    }
  });

  router.get("/studios/:slug/profile", async (req, res, next) => {
    try {
      const profile = await getStudioPaymentProfileBySlug(req.params.slug);
      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
