import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { authRateLimiter } from "../../middleware/rate-limit.js";
import { authContext, createAuthMiddleware } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
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

  router.post("/register", async (req, res) => {
    const result = await registerUser(parseBody(req, registerSchema), env);
    res.status(201).json(result);
  });

  router.post("/login", async (req, res) => {
    const { email, password } = parseBody(req, loginSchema);
    const result = await loginUser(email, password, env);
    res.json(result);
  });

  router.post("/logout", requireAuth, async (req, res) => {
    const { userId } = authContext(req);
    const result = await logoutUser(userId);
    res.json(result);
  });

  router.get("/me", requireAuth, async (req, res) => {
    const { userId } = authContext(req);
    const user = await getUserById(userId);
    res.json({ user });
  });

  router.patch("/me/role", requireAuth, async (req, res) => {
    const { role } = parseBody(req, updateRoleSchema);
    const { userId } = authContext(req);
    const result = await updateUserRole(userId, role, env);
    res.json(result);
  });

  return router;
}
