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
import { galleryPinRateLimiter } from "../../middleware/rate-limit.js";
import {
  getClientGalleryDetail,
  getClientPhotoDownloadUrl,
  listClientGalleries,
  recordClientGalleryDownload,
  verifyClientGalleryPin,
} from "./galleries.service.js";

const verifyPinSchema = z.object({
  pin: z.string().trim().min(1, "Enter the gallery access PIN."),
});

function readGalleryAccessPin(req: { get(name: string): string | undefined }) {
  const headerPin = req.get("X-Gallery-Access-Pin");
  if (headerPin?.trim()) {
    return headerPin.trim();
  }

  return undefined;
}

export function createClientGalleriesRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const galleries = await listClientGalleries(userId);
      res.json({ data: galleries });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await getClientGalleryDetail(userId, req.params.id, {
        accessPin: readGalleryAccessPin(req),
      });
      if (!detail) {
        throw new AppError("Gallery not found", 404);
      }
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  // A short numeric PIN with no throttle is guessable in a few thousand
  // requests, so this is the one route that needs a limiter more than the
  // writes do.
  // The explicit param type is needed because adding a second handler changes
  // which Express overload applies, widening `req.params` to string | string[].
  router.post<{ id: string }>(
    "/:id/verify-pin",
    galleryPinRateLimiter,
    async (req, res, next) => {
      try {
        const { userId } = (req as unknown as AuthenticatedRequest).auth;
        const parsed = verifyPinSchema.safeParse(req.body);
        if (!parsed.success) {
          throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
        }

        const result = await verifyClientGalleryPin(
          userId,
          req.params.id,
          parsed.data.pin,
        );
        res.json({ data: result });
      } catch (error) {
        next(error);
      }
    },
  );

  router.post("/:id/download", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const downloadPackage = await recordClientGalleryDownload(
        userId,
        req.params.id,
        { accessPin: readGalleryAccessPin(req) },
      );
      res.json({ data: downloadPackage });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/photos/:photoId/download", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const download = await getClientPhotoDownloadUrl(
        userId,
        req.params.id,
        req.params.photoId,
        { accessPin: readGalleryAccessPin(req) },
      );
      res.json({ data: download });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
