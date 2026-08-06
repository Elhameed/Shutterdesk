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
  archivePhotographerGallery,
  createPhotographerGallery,
  deleteGalleryPhoto,
  deliverPhotographerGallery,
  exportPhotographerGalleryReport,
  getPhotographerGalleryDetail,
  listPhotographerGalleries,
  notifyClientAboutGallery,
  reorderGalleryPhotos,
  updateGalleryDelivery,
  updateGalleryPhoto,
  updatePhotographerGallery,
  uploadGalleryPhotos,
} from "./galleries.service.js";

const createGallerySchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  category: z.enum(["wedding", "portrait", "graduation", "commercial"]),
  clientId: z.string().trim().min(1),
  bookingId: z.string().trim().optional(),
  visibility: z.enum(["public", "private", "password"]).optional(),
  allowDownloads: z.boolean().optional(),
  allowFavorites: z.boolean().optional(),
  socialSharing: z.boolean().optional(),
  statusSegment: z.enum(["draft", "editing", "ready"]).optional(),
  coverAssetKey: z.string().trim().min(1).optional(),
  expirationDate: z.string().trim().optional(),
  slug: z.string().trim().optional(),
  showPhotographerCredit: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  accessPin: z.string().trim().optional(),
});

const uploadPhotosSchema = z.object({
  photos: z
    .array(
      z.object({
        assetKey: z.string().trim().min(1),
        thumbnailAssetKey: z.string().trim().optional(),
        alt: z.string().trim().optional(),
      }),
    )
    .min(1),
});

const updatePhotoSchema = z.object({
  alt: z.string().trim().optional(),
  assetKey: z.string().trim().min(1).optional(),
});

const reorderPhotosSchema = z.object({
  photoIds: z.array(z.string().trim().min(1)).min(1),
});

const updateDeliverySchema = z.object({
  allowDownloads: z.boolean().optional(),
  highResDownloads: z.boolean().optional(),
  watermarkEnabled: z.boolean().optional(),
  clientNotified: z.boolean().optional(),
  deliveryNotes: z.string().trim().optional(),
  accessPin: z.string().trim().optional(),
  expiresAt: z.string().trim().optional(),
});


export function createPhotographerGalleriesRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const pagination =
        req.query.page !== undefined
          ? parsePaginationParams(req.query as Record<string, unknown>)
          : undefined;
      const galleries = await listPhotographerGalleries(userId, pagination);
      respondWithOptionalPagination(res, galleries);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const parsed = createGallerySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const gallery = await createPhotographerGallery(userId, parsed.data);
      res.status(201).json({ data: gallery });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await getPhotographerGalleryDetail(userId, req.params.id);
      if (!detail) {
        throw new AppError("Gallery not found", 404);
      }
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      const parsed = createGallerySchema.partial().safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const gallery = await updatePhotographerGallery(userId, req.params.id, parsed.data);
      res.json({ data: gallery });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/photos", async (req, res, next) => {
    try {
      const parsed = uploadPhotosSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const result = await uploadGalleryPhotos(userId, req.params.id, parsed.data.photos);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/photos/reorder", async (req, res, next) => {
    try {
      const parsed = reorderPhotosSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await reorderGalleryPhotos(
        userId,
        req.params.id,
        parsed.data.photoIds,
      );
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/photos/:photoId", async (req, res, next) => {
    try {
      const parsed = updatePhotoSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await updateGalleryPhoto(
        userId,
        req.params.id,
        req.params.photoId,
        parsed.data,
      );
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id/photos/:photoId", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await deleteGalleryPhoto(
        userId,
        req.params.id,
        req.params.photoId,
      );
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/delivery", async (req, res, next) => {
    try {
      const parsed = updateDeliverySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await updateGalleryDelivery(userId, req.params.id, parsed.data);
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/deliver", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const gallery = await deliverPhotographerGallery(userId, req.params.id);
      res.json({ data: gallery });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/notify-client", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await notifyClientAboutGallery(userId, req.params.id);
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/archive", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const detail = await archivePhotographerGallery(userId, req.params.id);
      res.json({ data: detail });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/export-report", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const report = await exportPhotographerGalleryReport(userId, req.params.id);
      res.json({ data: report });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
