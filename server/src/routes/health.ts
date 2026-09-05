import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

/**
 * Render exposes the deployed commit as RENDER_GIT_COMMIT. Reporting it makes
 * "did my deploy actually go out?" answerable from outside: while a new deploy
 * crash-loops, Render keeps serving the previous instance, so a healthy
 * response on its own proves nothing about the deploy you just triggered.
 */
const COMMIT = process.env.RENDER_GIT_COMMIT ?? "local";

healthRouter.get("/", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
      commit: COMMIT.slice(0, 7),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
