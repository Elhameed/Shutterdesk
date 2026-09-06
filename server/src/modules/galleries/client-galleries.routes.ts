import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
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

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const galleries = await listClientGalleries(userId);
    res.json({ data: galleries });
  });

  router.get("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await getClientGalleryDetail(userId, req.params.id, {
      accessPin: readGalleryAccessPin(req),
    });
    if (!detail) {
      throw new AppError("Gallery not found", 404);
    }
    res.json({ data: detail });
  });

  // A short numeric PIN with no throttle is guessable in a few thousand
  // requests, so this is the one route that needs a limiter more than the
  // writes do.
  router.post("/:id/verify-pin", galleryPinRateLimiter, async (req, res) => {
    const { userId } = authContext(req);
    const { pin } = parseBody(req, verifyPinSchema);
    const result = await verifyClientGalleryPin(userId, String(req.params.id), pin);
    res.json({ data: result });
  });

  router.post("/:id/download", async (req, res) => {
    const { userId } = authContext(req);
    const downloadPackage = await recordClientGalleryDownload(userId, req.params.id, {
      accessPin: readGalleryAccessPin(req),
    });
    res.json({ data: downloadPackage });
  });

  router.get("/:id/photos/:photoId/download", async (req, res) => {
    const { userId } = authContext(req);
    const download = await getClientPhotoDownloadUrl(
      userId,
      req.params.id,
      req.params.photoId,
      { accessPin: readGalleryAccessPin(req) },
    );
    res.json({ data: download });
  });

  return router;
}
