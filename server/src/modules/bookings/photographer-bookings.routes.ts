import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
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
} from "./photographer-bookings.service.js";

const createBookingSchema = z
  .object({
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
  })
  .strict();

const updateStatusSchema = z
  .object({ status: z.enum(["pending", "confirmed", "completed", "cancelled"]) })
  .strict();

const galleryReleaseOverrideSchema = z.object({ enabled: z.boolean() }).strict();

const rescheduleSchema = z
  .object({
    date: z.string().trim().min(1),
    time: z.string().trim().min(1),
  })
  .strict();

export function createPhotographerBookingsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);

    if (req.query.page !== undefined) {
      const pagination = parsePaginationParams(req.query as Record<string, unknown>);
      const result = await listPhotographerBookings(userId, pagination);
      respondWithOptionalPagination(res, result);
      return;
    }

    const bookings = await listPhotographerBookings(userId);
    res.json({ data: bookings });
  });

  router.post("/", async (req, res) => {
    const input = parseBody(req, createBookingSchema);
    const { userId } = authContext(req);
    const booking = await createPhotographerBooking(userId, input);
    res.status(201).json({ data: booking });
  });

  router.get("/:id/detail", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await getPhotographerBookingDetail(userId, req.params.id);
    if (!detail) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ data: detail });
  });

  router.get("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const booking = await getPhotographerBooking(userId, req.params.id);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ data: booking });
  });

  router.patch("/:id/status", async (req, res) => {
    const { status } = parseBody(req, updateStatusSchema);
    const { userId } = authContext(req);
    const booking = await updatePhotographerBookingStatus(userId, req.params.id, status);
    res.json({ data: booking });
  });

  router.patch("/:id/reschedule", async (req, res) => {
    const input = parseBody(req, rescheduleSchema);
    const { userId } = authContext(req);
    const booking = await reschedulePhotographerBooking(userId, req.params.id, input);
    res.json({ data: booking });
  });

  router.patch("/:id/gallery-release-override", async (req, res) => {
    const { enabled } = parseBody(req, galleryReleaseOverrideSchema);
    const { userId } = authContext(req);
    const detail = await setGalleryReleaseOverride(userId, req.params.id, enabled);
    res.json({ data: detail });
  });

  return router;
}
