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
  createClientBooking,
  getClientBooking,
  getClientBookingDetail,
  getClientGalleryIdForBooking,
  getUpcomingClientBooking,
  listClientBookings,
} from "./bookings.service.js";

const createClientBookingSchema = z.object({
  servicePackageId: z.string().trim().min(1),
  date: z.string().trim().min(1),
  time: z.string().trim().min(1),
  locationNotes: z.string().trim().default(""),
});


export function createClientBookingsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const bookings = await listClientBookings(userId);
      res.json({ data: bookings });
    } catch (error) {
      next(error);
    }
  });

  router.get("/upcoming", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await getUpcomingClientBooking(userId);
      res.json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const parsed = createClientBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await createClientBooking(userId, parsed.data);
      res.status(201).json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/detail", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await getClientBookingDetail(userId, req.params.id);
      if (!detail) {
        throw new AppError("Booking not found", 404);
      }
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/gallery", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const galleryId = await getClientGalleryIdForBooking(userId, req.params.id);
      res.json({ data: { galleryId: galleryId ?? null } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await getClientBooking(userId, req.params.id);
      if (!booking) {
        throw new AppError("Booking not found", 404);
      }
      res.json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
