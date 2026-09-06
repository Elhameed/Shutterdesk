import type { UserRole } from "@prisma/client";

/**
 * `createAuthMiddleware` attaches the authenticated principal to the request.
 * Declaring it here means route handlers can read `req.auth` directly instead
 * of casting through `(req as unknown as AuthenticatedRequest)`, which was
 * repeated 79 times across the route files.
 *
 * It is optional on the type because the property only exists after the auth
 * middleware has run; every router that reads it mounts `requireAuth` first.
 */
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
