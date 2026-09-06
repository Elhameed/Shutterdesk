import { Router } from "express";
import { z } from "zod";
import type { UserRole } from "@prisma/client";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
import { uploadRateLimiter } from "../../middleware/rate-limit.js";
import { createCloudinaryUploadSignature } from "../../lib/cloudinary.js";

const UPLOAD_CONTEXTS = ["receipts", "galleries", "avatars", "services"] as const;
type UploadContext = (typeof UPLOAD_CONTEXTS)[number];

const signSchema = z
  .object({
    context: z.enum(UPLOAD_CONTEXTS),
    resourceType: z.enum(["image", "raw"]).optional(),
  })
  .strict();

/** What each role is allowed to upload. Clients never touch gallery assets. */
const ALLOWED_CONTEXTS: Record<UserRole, ReadonlySet<UploadContext>> = {
  photographer: new Set<UploadContext>(["galleries", "avatars", "services"]),
  client: new Set<UploadContext>(["receipts", "avatars"]),
};

function createUploadsRouter(env: Env, role: UserRole) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.post(
    "/sign",
    requireAuth,
    requireRole(role),
    uploadRateLimiter,
    async (req, res) => {
      const { context, resourceType } = parseBody(req, signSchema);

      if (!ALLOWED_CONTEXTS[role].has(context)) {
        throw new AppError(`Invalid upload context for ${role}`, 403);
      }

      const signature = createCloudinaryUploadSignature(
        env,
        context,
        resourceType ?? "image",
      );
      res.json({ data: signature });
    },
  );

  return router;
}

export function createPhotographerUploadsRouter(env: Env) {
  return createUploadsRouter(env, "photographer");
}

export function createClientUploadsRouter(env: Env) {
  return createUploadsRouter(env, "client");
}
