import { Router } from "express";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import {
  getClientGalleryDetail,
  getClientPhotoDownloadUrl,
  listClientGalleries,
  recordClientGalleryDownload,
  verifyClientGalleryPin,
} from "./galleries.service.js";

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

  router.post("/:id/verify-pin", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const pin = typeof req.body?.pin === "string" ? req.body.pin : "";
      if (!pin.trim()) {
        throw new AppError("Enter the gallery access PIN.", 400);
      }

      const result = await verifyClientGalleryPin(userId, req.params.id, pin);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

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
