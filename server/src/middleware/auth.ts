import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import type { Env } from "../config/env.js";
import { loadAuthUser } from "../domain/auth-session.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "./error-handler.js";

export type AuthContext = {
  userId: string;
  email: string;
  role: UserRole;
};

export type AuthenticatedRequest = Request & { auth: AuthContext };

/**
 * Read the authenticated principal off a request.
 *
 * `req.auth` is declared optional (see src/types/express.d.ts) because it only
 * exists once the auth middleware has run, which the type system cannot prove.
 * Every router that reads it mounts `requireAuth` first, so the throw is a
 * guard against a future router forgetting to — not an expected path.
 */
export function authContext(req: Request): AuthContext {
  if (!req.auth) {
    throw new AppError("Authentication required", 401);
  }
  return req.auth;
}

export function createAuthMiddleware(env: Env) {
  return (req: Request, _res: Response, next: NextFunction) => {
    void (async () => {
      const header = req.headers.authorization;

      if (!header?.startsWith("Bearer ")) {
        next(new AppError("Authentication required", 401));
        return;
      }

      const token = header.slice("Bearer ".length).trim();

      try {
        const payload = verifyAccessToken(token, env);
        const user = await loadAuthUser(payload.userId);

        if (!user) {
          next(new AppError("Invalid or expired token", 401));
          return;
        }

        const tokenVersion = payload.tokenVersion ?? 0;
        if (tokenVersion !== user.tokenVersion) {
          next(new AppError("Session expired. Please sign in again.", 401));
          return;
        }

        req.auth = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
        next();
      } catch {
        next(new AppError("Invalid or expired token", 401));
      }
    })();
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.auth;

    if (!auth) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!roles.includes(auth.role)) {
      next(new AppError("You do not have permission to access this resource", 403));
      return;
    }

    next();
  };
}
