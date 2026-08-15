import { Router } from "express";
import { z } from "zod";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  createAuthMiddleware,
  requireRole,
  type AuthenticatedRequest,
} from "../../middleware/auth.js";
import {
  deactivateClientAccount,
  deactivatePhotographerAccount,
} from "../../lib/account-deactivation.js";
import {
  SETTINGS_PANELS,
  getClientSettings,
  getPhotographerSettingsPanel,
  updateClientNotificationSettings,
  updateClientSecuritySettings,
  updateClientSettings,
  updatePhotographerSettingsPanel,
  type SettingsPanel,
} from "./settings.service.js";

const clientProfileSchema = z
  .object({
    fullName: z.string().trim().min(1).optional(),
    phone: z.string().trim().min(1).optional(),
    address: z.string().trim().min(1).optional(),
    interests: z.array(z.string()).min(1).optional(),
    avatarUrl: z.string().url().optional(),
  })
  .strict();

const clientSecuritySchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .strict();

const notificationChannelSchema = z
  .object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    inApp: z.boolean().optional(),
  })
  .strict();

const clientNotificationsSchema = z
  .object({
    bookingUpdates: notificationChannelSchema.optional(),
    paymentUpdates: notificationChannelSchema.optional(),
    galleryUpdates: notificationChannelSchema.optional(),
  })
  .strict();

const photographerProfileSchema = z
  .object({
    fullName: z.string().trim().min(1).optional(),
    displayName: z.string().trim().optional(),
    bio: z.string().optional(),
    email: z.string().email().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
    avatar: z.string().optional(),
  })
  .strict();

const photographerStudioSchema = z
  .object({
    studioName: z.string().trim().min(1).optional(),
    specialization: z.string().optional(),
    brandAccentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    logoAssetKey: z.string().optional(),
    watermarkAssetKey: z.string().optional(),
  })
  .strict();

const photographerPaymentSchema = z
  .object({
    bankTransferEnabled: z.boolean().optional(),
    accountName: z.string().optional(),
    accountNumber: z.string().optional(),
    mobileMoneyEnabled: z.boolean().optional(),
    momoAccountName: z.string().optional(),
    momoNumber: z.string().optional(),
    merchantCode: z.string().optional(),
    provider: z.string().optional(),
    depositRequirement: z.enum(["half", "none"]).optional(),
  })
  .strict();

const photographerNotificationSchema = z
  .object({
    newBooking: notificationChannelSchema.optional(),
    paymentReceived: notificationChannelSchema.optional(),
    galleryFavorites: notificationChannelSchema.optional(),
  })
  .strict();

const photographerGallerySchema = z
  .object({
    allowDownloads: z.boolean().optional(),
    passwordProtection: z.boolean().optional(),
    watermarkGridView: z.boolean().optional(),
    watermarkRemoveOnPaid: z.boolean().optional(),
    allowClientDisableWatermark: z.boolean().optional(),
  })
  .strict();

const photographerBookingSchema = z
  .object({
    maxDaysAhead: z.number().int().min(1).max(365).optional(),
    slotIntervalMinutes: z.number().int().min(15).max(120).optional(),
    bufferMinutes: z.number().int().min(0).max(120).optional(),
    cancellationPolicy: z.string().max(2000).optional(),
  })
  .strict();

const photographerSecuritySchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8).optional(),
    confirmPassword: z.string().optional(),
  })
  .strict();

const photographerBillingSchema = z
  .object({
    invoices: z
      .array(
        z.object({
          id: z.string(),
          date: z.string(),
          invoice: z.string(),
          amount: z.number(),
          status: z.string(),
        }),
      )
      .optional(),
  })
  .strict();

const PHOTOGRAPHER_PANEL_SCHEMAS = {
  profile: photographerProfileSchema,
  studio: photographerStudioSchema,
  payment: photographerPaymentSchema,
  notifications: photographerNotificationSchema,
  gallery: photographerGallerySchema,
  booking: photographerBookingSchema,
  security: photographerSecuritySchema,
  billing: photographerBillingSchema,
} as const;

function isSettingsPanel(value: string): value is SettingsPanel {
  return (SETTINGS_PANELS as readonly string[]).includes(value);
}

function parsePhotographerPanelPayload(panel: SettingsPanel, body: unknown) {
  const schema = PHOTOGRAPHER_PANEL_SCHEMAS[panel];
  const parsed = schema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
  }
  return parsed.data;
}

export function createPhotographerSettingsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("photographer"));

  router.post("/deactivate", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      await deactivatePhotographerAccount(userId);
      res.json({ data: { deactivated: true } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:panel", async (req, res, next) => {
    try {
      if (!isSettingsPanel(req.params.panel)) {
        throw new AppError("Unknown settings panel", 400);
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await getPhotographerSettingsPanel(userId, req.params.panel);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/:panel", async (req, res, next) => {
    try {
      if (!isSettingsPanel(req.params.panel)) {
        throw new AppError("Unknown settings panel", 400);
      }

      const payload = parsePhotographerPanelPayload(req.params.panel, req.body);

      if (req.params.panel === "security") {
        const securityPayload = payload as z.infer<typeof photographerSecuritySchema>;
        if (
          securityPayload.newPassword &&
          securityPayload.newPassword !== securityPayload.confirmPassword
        ) {
          throw new AppError("New passwords do not match", 400);
        }
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await updatePhotographerSettingsPanel(
        userId,
        req.params.panel,
        payload,
      );
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export function createClientSettingsRouter(env: Env) {
  const router = Router();
  const requireAuth = createAuthMiddleware(env);

  router.use(requireAuth, requireRole("client"));

  router.post("/deactivate", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      await deactivateClientAccount(userId);
      res.json({ data: { deactivated: true } });
    } catch (error) {
      next(error);
    }
  });

  router.get("/", async (req, res, next) => {
    try {
      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await getClientSettings(userId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/", async (req, res, next) => {
    try {
      const parsed = clientProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await updateClientSettings(userId, parsed.data);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/notifications", async (req, res, next) => {
    try {
      const parsed = clientNotificationsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await updateClientNotificationSettings(userId, parsed.data);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  router.patch("/security", async (req, res, next) => {
    try {
      const parsed = clientSecuritySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0]?.message ?? "Invalid payload", 400);
      }

      if (parsed.data.newPassword !== parsed.data.confirmPassword) {
        throw new AppError("New passwords do not match", 400);
      }

      const { userId } = (req as unknown as AuthenticatedRequest).auth;
      const data = await updateClientSecuritySettings(userId, parsed.data);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
