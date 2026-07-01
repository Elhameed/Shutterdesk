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
  createPhotographerService,
  deletePhotographerService,
  duplicatePhotographerService,
  getPhotographerService,
  listPhotographerServices,
  updatePhotographerService,
} from "./services.service.js";

const createServiceSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  price: z.number().int().nonnegative(),
  depositPercent: z.number().int().min(0).max(100).optional(),
  category: z.enum(["wedding", "portrait", "commercial", "editorial"]),
  duration: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  isDraft: z.literal(false).optional(),
  coverAssetKey: z.string().trim().optional(),
  badges: z.array(z.string()).optional(),
  photographers: z.number().int().positive().optional(),
  locationType: z.string().trim().optional(),
  editedPhotos: z.number().int().nonnegative().optional(),
  revisions: z.number().int().nonnegative().optional(),
  onlineGallery: z.boolean().optional(),
  printDelivery: z.boolean().optional(),
  commercialLicense: z.boolean().optional(),
  includes: z.array(z.string()).optional(),
  additionalNotes: z.string().trim().optional(),
});

const patchServiceSchema = createServiceSchema.partial().extend({
  isDraft: z.boolean().optional(),
});

const draftServiceSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  price: z.number().int().nonnegative().optional(),
  depositPercent: z.number().int().min(0).max(100).optional(),
  category: z.enum(["wedding", "portrait", "commercial", "editorial"]).optional(),
  duration: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  isDraft: z.literal(true),
  coverAssetKey: z.string().trim().optional(),
  badges: z.array(z.string()).optional(),
  photographers: z.number().int().positive().optional(),
  locationType: z.string().trim().optional(),
  editedPhotos: z.number().int().nonnegative().optional(),
  revisions: z.number().int().nonnegative().optional(),
  onlineGallery: z.boolean().optional(),
  printDelivery: z.boolean().optional(),
  commercialLicense: z.boolean().optional(),
  includes: z.array(z.string()).optional(),
  additionalNotes: z.string().trim().optional(),
});


export function createPhotographerServicesRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const services = await listPhotographerServices(userId);
      res.json({ data: services });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const service = await getPhotographerService(userId, req.params.id);
      if (!service) {
        throw new AppError("Service package not found", 404);
      }
      res.json({ data: service });
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const isDraft = req.body?.isDraft === true;
      const parsed = (isDraft ? draftServiceSchema : createServiceSchema).safeParse(
        req.body,
      );
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const service = await createPhotographerService(userId, parsed.data);
      res.status(201).json({ data: service });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id", async (req, res, next) => {
    try {
      const isDraft = req.body?.isDraft === true;
      const parsed = (isDraft ? draftServiceSchema : patchServiceSchema).safeParse(
        req.body,
      );
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const service = await updatePhotographerService(
        userId,
        req.params.id,
        parsed.data,
      );
      res.json({ data: service });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:id/duplicate", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const service = await duplicatePhotographerService(userId, req.params.id);
      res.status(201).json({ data: service });
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const result = await deletePhotographerService(userId, req.params.id);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createClientServicesRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res, next) => {
    try {
      const { listPublicClientServices, listPublicClientServicesByStudioSlug } =
        await import("./services.service.js");
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const studioSlug =
        typeof req.query.studioSlug === "string" ? req.query.studioSlug : null;

      const services = studioSlug
        ? await listPublicClientServicesByStudioSlug(userId, studioSlug)
        : await listPublicClientServices(userId);
      res.json({ data: services });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
