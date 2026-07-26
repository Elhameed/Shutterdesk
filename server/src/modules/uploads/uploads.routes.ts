import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatZodErrors } from "../../lib/format-zod-errors.js";
import {
  createAuthMiddleware,
  requireRole,
} from "../../middleware/auth.js";
import { uploadRateLimiter } from "../../middleware/rate-limit.js";
import { createCloudinaryUploadSignature } from "../../lib/cloudinary.js";

const signSchema = z.object({
  context: z.enum(["receipts", "galleries", "avatars", "services"]),
  resourceType: z.enum(["image", "raw"]).optional(),
});

const PHOTOGRAPHER_UPLOAD_CONTEXTS = new Set(["galleries", "avatars", "services"]);
const CLIENT_UPLOAD_CONTEXTS = new Set(["receipts", "avatars"]);


export function createPhotographerUploadsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.post("/sign", requireAuth, requireRole("photographer"), uploadRateLimiter, (req, res, next) => {
    try {
      const parsed = signSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      if (!PHOTOGRAPHER_UPLOAD_CONTEXTS.has(parsed.data.context)) {
        throw new AppError("Invalid upload context for photographer", 403);
      }

      const signature = createCloudinaryUploadSignature(
        env,
        parsed.data.context,
        parsed.data.resourceType ?? "image",
      );
      res.json({ data: signature });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createClientUploadsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.post("/sign", requireAuth, requireRole("client"), uploadRateLimiter, (req, res, next) => {
    try {
      const parsed = signSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      if (!CLIENT_UPLOAD_CONTEXTS.has(parsed.data.context)) {
        throw new AppError("Invalid upload context for client", 403);
      }

      const resourceType =
        parsed.data.resourceType ??
        (parsed.data.context === "receipts" ? "image" : "image");

      const signature = createCloudinaryUploadSignature(
        env,
        parsed.data.context,
        resourceType,
      );
      res.json({ data: signature });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
