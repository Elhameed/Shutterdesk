import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatZodErrors } from "../../lib/format-zod-errors.js";
import { authRateLimiter } from "../../middleware/rate-limit.js";
import {
  createAuthMiddleware,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import { updateUserRole } from "../onboarding/onboarding.service.js";
import { getUserById, loginUser, logoutUser, registerUser } from "./auth.service.js";

const updateRoleSchema = z.object({
  role: z.enum(["photographer", "client"]),
});

const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["photographer", "client"]).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export function createAuthRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(authRateLimiter);

  router.post("/register", async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const result = await registerUser(parsed.data, env);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const result = await loginUser(parsed.data.email, parsed.data.password, env);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.post("/logout", requireAuth, async (req, res, next) => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const result = await logoutUser(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuth, async (req, res, next) => {
    try {
      const { userId } = (req as AuthenticatedRequest).auth;
      const user = await getUserById(userId);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/me/role", requireAuth, async (req, res, next) => {
    try {
      const parsed = updateRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as AuthenticatedRequest).auth;
      const result = await updateUserRole(userId, parsed.data.role, env);
      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
