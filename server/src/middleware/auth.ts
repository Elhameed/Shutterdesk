import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@prisma/client";
import type { Env } from "../config/env.js";
import { loadAuthUser } from "../lib/auth-session.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "./error-handler.js";

export type AuthenticatedRequest = Request & {
  auth: {
    userId: string;
    email: string;
    role: UserRole;
  };
};

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

        (req as AuthenticatedRequest).auth = {
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
    const auth = (req as AuthenticatedRequest).auth;

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
