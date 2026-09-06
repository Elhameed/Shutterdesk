import { Router } from "express";
import type { Env } from "../config/env.js";
import { isCloudinaryConfigured } from "../lib/cloudinary.js";
import { prisma } from "../lib/prisma.js";

/**
 * Render exposes the deployed commit as RENDER_GIT_COMMIT. Reporting it makes
 * "did my deploy actually go out?" answerable from outside: while a new deploy
 * crash-loops, Render keeps serving the previous instance, so a healthy
 * response on its own proves nothing about the deploy you just triggered.
 */
const COMMIT = process.env.RENDER_GIT_COMMIT ?? "local";

export function createHealthRouter(env: Env) {
  const router = Router();

  router.get("/", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
      // Whether the CLOUDINARY_* variables are present — never their values.
      // Uploads are the one feature that fails independently of everything
      // else, and its endpoints are authenticated, so without this there is
      // no way to confirm the credentials landed short of driving the UI.
      uploads: isCloudinaryConfigured(env) ? "configured" : "unconfigured",
      commit: COMMIT.slice(0, 7),
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
