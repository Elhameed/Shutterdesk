import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { formatZodErrors } from "../../lib/format-zod-errors.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import { parsePaginationParams } from "../../lib/pagination.js";
import { respondWithOptionalPagination } from "../../lib/route-pagination.js";
import {
  createStudioClient,
  getStudioClientById,
  getStudioClientProfile,
  listStudioClients,
  updateStudioClientNotes,
} from "./clients.service.js";

const createClientSchema = z.object({
  name: z.string().trim().min(1, "Client name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(1, "Phone number is required"),
  category: z.enum(["wedding", "commercial", "portrait", "editorial"]),
  location: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateNotesSchema = z.object({
  notes: z.string().max(5000),
});


export function createPhotographerClientsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const pagination =
        req.query.page !== undefined
          ? parsePaginationParams(req.query as Record<string, unknown>)
          : undefined;
      const clients = await listStudioClients(userId, pagination);
      respondWithOptionalPagination(res, clients);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const parsed = createClientSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const client = await createStudioClient(userId, parsed.data);
      res.status(201).json({ data: client });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id/profile", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const profile = await getStudioClientProfile(userId, req.params.id);

      if (!profile) {
        throw new AppError("Client not found", 404);
      }

      res.json({ data: profile });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:id/notes", async (req, res, next) => {
    try {
      const parsed = updateNotesSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError("Validation failed", 400, formatZodErrors(parsed.error));
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const notes = await updateStudioClientNotes(
        userId,
        req.params.id,
        parsed.data.notes,
      );

      if (notes === null) {
        throw new AppError("Client not found", 404);
      }

      res.json({ data: { notes } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const client = await getStudioClientById(userId, req.params.id);

      if (!client) {
        throw new AppError("Client not found", 404);
      }

      res.json({ data: client });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
