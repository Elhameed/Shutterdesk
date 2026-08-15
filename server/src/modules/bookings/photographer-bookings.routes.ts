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
import { parsePaginationParams } from "../../lib/pagination.js";
import { respondWithOptionalPagination } from "../../lib/route-pagination.js";
import {
  createPhotographerBooking,
  getPhotographerBooking,
  getPhotographerBookingDetail,
  listPhotographerBookings,
  reschedulePhotographerBooking,
  setGalleryReleaseOverride,
  updatePhotographerBookingStatus,
} from "./bookings.service.js";

const createBookingSchema = z.object({
  clientId: z.string().uuid().optional(),
  clientName: z.string().trim().min(1),
  email: z.string().trim().email(),
  avatarAssetKey: z.string().optional(),
  servicePackageId: z.string().uuid().optional(),
  packageName: z.string().trim().min(1),
  packageDetail: z.string().trim().min(1),
  date: z.string().trim().min(1),
  time: z.string().trim().min(1),
  packagePrice: z.number().int().positive().optional(),
  venue: z.string().trim().optional(),
  locationNotes: z.string().trim().optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

const galleryReleaseOverrideSchema = z.object({
  enabled: z.boolean(),
});

const rescheduleSchema = z.object({
  date: z.string().trim().min(1),
  time: z.string().trim().min(1),
});


export function createPhotographerBookingsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      if (req.query.page !== undefined) {
        const pagination = parsePaginationParams(req.query as Record<string, unknown>);
        const result = await listPhotographerBookings(userId, pagination);
        respondWithOptionalPagination(res, result);
        return;
      }
      const bookings = await listPhotographerBookings(userId);
      res.json({ data: bookings });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await createPhotographerBooking(userId, parsed.data);
      res.status(201).json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/detail", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await getPhotographerBookingDetail(userId, req.params.id);
      if (!detail) {
        throw new AppError("Booking not found", 404);
      }
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await getPhotographerBooking(userId, req.params.id);
      if (!booking) {
        throw new AppError("Booking not found", 404);
      }
      res.json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/status", async (req, res, next) => {
    try {
      const parsed = updateStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await updatePhotographerBookingStatus(
        userId,
        req.params.id,
        parsed.data.status,
      );
      res.json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/reschedule", async (req, res, next) => {
    try {
      const parsed = rescheduleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const booking = await reschedulePhotographerBooking(
        userId,
        req.params.id,
        parsed.data,
      );
      res.json({ data: booking });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/gallery-release-override", async (req, res, next) => {
    try {
      const parsed = galleryReleaseOverrideSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await setGalleryReleaseOverride(
        userId,
        req.params.id,
        parsed.data.enabled,
      );
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
