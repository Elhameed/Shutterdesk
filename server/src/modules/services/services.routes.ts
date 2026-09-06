import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
import {
  createPhotographerService,
  deletePhotographerService,
  duplicatePhotographerService,
  getPhotographerService,
  listPhotographerServices,
  listPublicClientServices,
  listPublicClientServicesByStudioSlug,
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

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const services = await listPhotographerServices(userId);
    res.json({ data: services });
  });

  router.get("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const service = await getPhotographerService(userId, req.params.id);
    if (!service) {
      throw new AppError("Service package not found", 404);
    }
    res.json({ data: service });
  });

  router.post("/", async (req, res) => {
    // Drafts are allowed to be incomplete, so they validate against a laxer
    // schema than a package being published.
    const isDraft = req.body?.isDraft === true;
    const input = parseBody(req, isDraft ? draftServiceSchema : createServiceSchema);
    const { userId } = authContext(req);
    const service = await createPhotographerService(userId, input);
    res.status(201).json({ data: service });
  });

  router.patch("/:id", async (req, res) => {
    const isDraft = req.body?.isDraft === true;
    const input = parseBody(req, isDraft ? draftServiceSchema : patchServiceSchema);
    const { userId } = authContext(req);
    const service = await updatePhotographerService(userId, req.params.id, input);
    res.json({ data: service });
  });

  router.post("/:id/duplicate", async (req, res) => {
    const { userId } = authContext(req);
    const service = await duplicatePhotographerService(userId, req.params.id);
    res.status(201).json({ data: service });
  });

  router.delete("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const result = await deletePhotographerService(userId, req.params.id);
    res.json({ data: result });
  });

  return router;
}

export function createClientServicesRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const studioSlug =
      typeof req.query.studioSlug === "string" ? req.query.studioSlug : null;

    const services = studioSlug
      ? await listPublicClientServicesByStudioSlug(userId, studioSlug)
      : await listPublicClientServices(userId);
    res.json({ data: services });
  });

  return router;
}
