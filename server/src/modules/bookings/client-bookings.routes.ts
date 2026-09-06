import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
import {
  createClientBooking,
  getClientBooking,
  getClientBookingDetail,
  getClientGalleryIdForBooking,
  getUpcomingClientBooking,
  listClientBookings,
} from "./bookings.service.js";

const createClientBookingSchema = z
  .object({
    servicePackageId: z.string().trim().min(1),
    date: z.string().trim().min(1),
    time: z.string().trim().min(1),
    locationNotes: z.string().trim().default(""),
  })
  .strict();

export function createClientBookingsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const bookings = await listClientBookings(userId);
    res.json({ data: bookings });
  });

  router.get("/upcoming", async (req, res) => {
    const { userId } = authContext(req);
    const booking = await getUpcomingClientBooking(userId);
    res.json({ data: booking });
  });

  router.post("/", async (req, res) => {
    const input = parseBody(req, createClientBookingSchema);
    const { userId } = authContext(req);
    const booking = await createClientBooking(userId, input);
    res.status(201).json({ data: booking });
  });

  router.get("/:id/detail", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await getClientBookingDetail(userId, req.params.id);
    if (!detail) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ data: detail });
  });

  router.get("/:id/gallery", async (req, res) => {
    const { userId } = authContext(req);
    const galleryId = await getClientGalleryIdForBooking(userId, req.params.id);
    res.json({ data: { galleryId: galleryId ?? null } });
  });

  router.get("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const booking = await getClientBooking(userId, req.params.id);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }
    res.json({ data: booking });
  });

  return router;
}
