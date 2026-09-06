import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { authContext, createAuthMiddleware, requireRole } from "../../middleware/auth.js";
import { parseBody } from "../../middleware/validate.js";
import { parsePaginationParams } from "../../lib/pagination.js";
import { respondWithOptionalPagination } from "../../lib/route-pagination.js";
import {
  createStudioClient,
  getStudioClientById,
  getStudioClientProfile,
  listStudioClients,
  updateStudioClientNotes,
} from "./clients.service.js";

const createClientSchema = z
  .object({
    name: z.string().trim().min(1, "Client name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z.string().trim().min(1, "Phone number is required"),
    category: z.enum(["wedding", "commercial", "portrait", "editorial"]),
    location: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .strict();

const updateNotesSchema = z.object({ notes: z.string().max(5000) }).strict();

export function createPhotographerClientsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.get("/", async (req, res) => {
    const { userId } = authContext(req);
    const pagination =
      req.query.page !== undefined
        ? parsePaginationParams(req.query as Record<string, unknown>)
        : undefined;
    const clients = await listStudioClients(userId, pagination);
    respondWithOptionalPagination(res, clients);
  });

  router.post("/", async (req, res) => {
    const { userId } = authContext(req);
    const client = await createStudioClient(userId, parseBody(req, createClientSchema));
    res.status(201).json({ data: client });
  });

  router.get("/:id/profile", async (req, res) => {
    const { userId } = authContext(req);
    const profile = await getStudioClientProfile(userId, req.params.id);

    if (!profile) {
      throw new AppError("Client not found", 404);
    }

    res.json({ data: profile });
  });

  router.patch("/:id/notes", async (req, res) => {
    const { userId } = authContext(req);
    const { notes: submitted } = parseBody(req, updateNotesSchema);
    const notes = await updateStudioClientNotes(userId, req.params.id, submitted);

    if (notes === null) {
      throw new AppError("Client not found", 404);
    }

    res.json({ data: { notes } });
  });

  router.get("/:id", async (req, res) => {
    const { userId } = authContext(req);
    const client = await getStudioClientById(userId, req.params.id);

    if (!client) {
      throw new AppError("Client not found", 404);
    }

    res.json({ data: client });
  });

  return router;
}
