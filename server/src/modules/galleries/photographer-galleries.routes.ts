import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
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

/** Update accepts any subset of the create fields. */
const updateGallerySchema = createGallerySchema.partial();

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

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const pagination =
      req.query.page !== undefined
        ? parsePaginationParams(req.query as Record<string, unknown>)
        : undefined;
    const galleries = await listPhotographerGalleries(userId, pagination);
    respondWithOptionalPagination(res, galleries);
  });

  router.post("/", async (req, res) => {
    const input = parseBody(req, createGallerySchema);
    const { userId } = authContext(req);
    const gallery = await createPhotographerGallery(userId, input);
    res.status(201).json({ data: gallery });
  });

  router.get("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await getPhotographerGalleryDetail(userId, req.params.id);
    if (!detail) {
      throw new AppError("Gallery not found", 404);
    }
    res.json({ data: detail });
  });

  router.patch("/:id", async (req, res) => {
    const input = parseBody(req, updateGallerySchema);
    const { userId } = authContext(req);
    const gallery = await updatePhotographerGallery(userId, req.params.id, input);
    res.json({ data: gallery });
  });

  router.post("/:id/photos", async (req, res) => {
    const { photos } = parseBody(req, uploadPhotosSchema);
    const { userId } = authContext(req);
    const result = await uploadGalleryPhotos(userId, req.params.id, photos);
    res.status(201).json({ data: result });
  });

  router.patch("/:id/photos/reorder", async (req, res) => {
    const { photoIds } = parseBody(req, reorderPhotosSchema);
    const { userId } = authContext(req);
    const detail = await reorderGalleryPhotos(userId, req.params.id, photoIds);
    res.json({ data: detail });
  });

  router.patch("/:id/photos/:photoId", async (req, res) => {
    const input = parseBody(req, updatePhotoSchema);
    const { userId } = authContext(req);
    const detail = await updateGalleryPhoto(
      userId,
      req.params.id,
      req.params.photoId,
      input,
    );
    res.json({ data: detail });
  });

  router.delete("/:id/photos/:photoId", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await deleteGalleryPhoto(userId, req.params.id, req.params.photoId);
    res.json({ data: detail });
  });

  router.patch("/:id/delivery", async (req, res) => {
    const input = parseBody(req, updateDeliverySchema);
    const { userId } = authContext(req);
    const detail = await updateGalleryDelivery(userId, req.params.id, input);
    res.json({ data: detail });
  });

  router.post("/:id/deliver", async (req, res) => {
    const { userId } = authContext(req);
    const gallery = await deliverPhotographerGallery(userId, req.params.id);
    res.json({ data: gallery });
  });

  router.post("/:id/notify-client", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await notifyClientAboutGallery(userId, req.params.id);
    res.json({ data: detail });
  });

  router.post("/:id/archive", async (req, res) => {
    const { userId } = authContext(req);
    const detail = await archivePhotographerGallery(userId, req.params.id);
    res.json({ data: detail });
  });

  router.get("/:id/export-report", async (req, res) => {
    const { userId } = authContext(req);
    const report = await exportPhotographerGalleryReport(userId, req.params.id);
    res.json({ data: report });
  });

  return router;
}
