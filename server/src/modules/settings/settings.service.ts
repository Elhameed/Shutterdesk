import { hashPassword, verifyPassword } from "../../lib/password.js";
import { invalidateUserTokens } from "../../lib/auth-session.js";
import { prisma } from "../../lib/prisma.js";
import { loadEnv } from "../../config/env.js";
import {
  isCloudinaryConfigured,
  normalizeStoredMediaUrl,
} from "../../lib/cloudinary.js";
import { syncClientProfileAcrossRecords } from "../../lib/client-profile-sync.js";
import { syncPhotographerIdentityAcrossRecords } from "../../lib/photographer-identity-sync.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { getOrCreateStudioSchedule } from "../availability/availability.service.js";
import { AppError } from "../../middleware/error-handler.js";

export const SETTINGS_PANELS = [
  "profile",
  "studio",
  "payment",
  "notifications",
  "gallery",
  "booking",
  "security",
  "billing",
] as const;

export type SettingsPanel = (typeof SETTINGS_PANELS)[number];

const DEFAULT_BRAND_ACCENT = "#795900";

const DEFAULT_NOTIFICATION_PREFS = {
  newBooking: { email: true, sms: true, inApp: true },
  paymentReceived: { email: true, sms: true, inApp: true },
  galleryFavorites: { email: false, sms: false, inApp: true },
};

export const DEFAULT_GALLERY = {
  allowDownloads: true,
  passwordProtection: false,
  watermarkGridView: true,
  watermarkRemoveOnPaid: true,
  allowClientDisableWatermark: false,
};

export function readStudioGalleryDefaults(studio: { gallerySettings: unknown }) {
  return readJson(studio.gallerySettings, DEFAULT_GALLERY);
}

const DEFAULT_SECURITY = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: false,
};

const DEFAULT_BILLING = {
  invoices: [] as Array<{
    id: string;
    date: string;
    invoice: string;
    amount: number;
    status: string;
  }>,
};

function resolveProfileAvatar(avatar: unknown) {
  if (typeof avatar !== "string" || !avatar.trim()) {
    return null;
  }

  const env = loadEnv();
  if (avatar.startsWith("http")) {
    return normalizeStoredMediaUrl(env, avatar, "Profile photo");
  }

  if (isCloudinaryConfigured(env)) {
    return null;
  }

  return avatar.replace(/^\//, "");
}

function profileDefaultsFromOwner(
  owner: { fullName: string; email: string },
  studio: { slug: string },
) {
  const firstName = owner.fullName.split(" ")[0] ?? owner.fullName;

  return {
    fullName: owner.fullName,
    displayName: firstName,
    bio: "",
    email: owner.email,
    instagram: "",
    website: `shutterdesk.rw/studios/${studio.slug}`,
    avatar: "app/user-avatar",
  };
}

function brandDefaultsFromStudio(studio: { name: string }) {
  return {
    studioName: studio.name,
    brandAccentColor: DEFAULT_BRAND_ACCENT,
    specialization: "",
    logoAssetKey: "",
    watermarkAssetKey: "",
  };
}

function bookingDefaultsFromSchedule(schedule: {
  maxDaysAhead: number;
  slotIntervalMinutes: number;
  bufferMinutes: number;
} | null) {
  return {
    maxDaysAhead: schedule?.maxDaysAhead ?? 60,
    slotIntervalMinutes: schedule?.slotIntervalMinutes ?? 30,
    bufferMinutes: schedule?.bufferMinutes ?? 15,
    cancellationPolicy: "",
  };
}

function readBookingSettings(studio: {
  brandSettings: unknown;
  schedule: {
    maxDaysAhead: number;
    slotIntervalMinutes: number;
    bufferMinutes: number;
  } | null;
}) {
  const brand = readJson(studio.brandSettings, {});
  const stored =
    brand && typeof brand === "object" && "bookingSettings" in brand
      ? readJson((brand as { bookingSettings?: unknown }).bookingSettings, {
          cancellationPolicy: "",
        })
      : { cancellationPolicy: "" };

  return {
    ...bookingDefaultsFromSchedule(studio.schedule),
    cancellationPolicy:
      typeof stored.cancellationPolicy === "string" ? stored.cancellationPolicy : "",
  };
}

function readJson<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "object") return fallback;
  return { ...fallback, ...(value as T) };
}

function readPaymentProfile(value: unknown) {
  const profile = readJson(value, {
    bankTransferEnabled: true,
    mobileMoneyEnabled: false,
    accountName: "",
    accountNumber: "",
    depositRequirement: "half" as const,
    momoAccountName: "",
    momoNumber: "",
    merchantCode: "",
    provider: "",
    referenceHint: "",
  });

  return {
    bankTransferEnabled: profile.bankTransferEnabled ?? true,
    accountName: profile.accountName ?? "",
    accountNumber: profile.accountNumber ?? "",
    mobileMoneyEnabled: profile.mobileMoneyEnabled ?? false,
    momoAccountName: profile.momoAccountName ?? "",
    momoNumber: profile.momoNumber ?? "",
    merchantCode: profile.merchantCode ?? "",
    provider: profile.provider ?? "MTN Mobile Money (MoMo)",
    depositRequirement: profile.depositRequirement ?? "half",
  };
}

async function getStudioWithOwner(photographerUserId: string) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const owner = await prisma.user.findUnique({
    where: { id: photographerUserId },
  });

  if (!owner) {
    throw new AppError("User not found", 404);
  }

  const schedule = await prisma.studioSchedule.findUnique({
    where: { studioId: studio.id },
  });

  return { studio, owner, schedule };
}

export async function getPhotographerSettingsPanel(
  photographerUserId: string,
  panel: SettingsPanel,
) {
  const { studio, owner, schedule } = await getStudioWithOwner(photographerUserId);

  switch (panel) {
    case "profile": {
      const stored = readJson(
        studio.profileSettings,
        profileDefaultsFromOwner(owner, studio),
      );
      const avatar =
        owner.avatarUrl ??
        (typeof stored.avatar === "string" ? stored.avatar : "app/user-avatar");
      return {
        ...stored,
        fullName: owner.fullName,
        email: owner.email,
        avatar,
      };
    }
    case "studio": {
      const stored = readJson(studio.brandSettings, brandDefaultsFromStudio(studio));
      return {
        studioName: studio.name,
        specialization:
          typeof stored.specialization === "string" ? stored.specialization : "",
        brandAccentColor: stored.brandAccentColor ?? DEFAULT_BRAND_ACCENT,
        logoAssetKey:
          typeof stored.logoAssetKey === "string" ? stored.logoAssetKey : "",
        watermarkAssetKey:
          typeof stored.watermarkAssetKey === "string" ? stored.watermarkAssetKey : "",
      };
    }
    case "payment":
      return readPaymentProfile(studio.paymentProfile);
    case "notifications":
      return readJson(studio.notificationPrefs, DEFAULT_NOTIFICATION_PREFS);
    case "gallery":
      return readJson(studio.gallerySettings, DEFAULT_GALLERY);
    case "booking": {
      const ensuredSchedule =
        schedule ?? (await getOrCreateStudioSchedule(studio.id));
      return readBookingSettings({
        brandSettings: studio.brandSettings,
        schedule: ensuredSchedule,
      });
    }
    case "security":
      return {
        ...DEFAULT_SECURITY,
        twoFactorEnabled: readJson(studio.securitySettings, DEFAULT_SECURITY)
          .twoFactorEnabled,
      };
    case "billing":
      return readJson(studio.billingSettings, DEFAULT_BILLING);
    default:
      throw new AppError("Unknown settings panel", 400);
  }
}

export async function updatePhotographerSettingsPanel(
  photographerUserId: string,
  panel: SettingsPanel,
  payload: Record<string, unknown>,
) {
  const { studio, owner, schedule } = await getStudioWithOwner(photographerUserId);

  switch (panel) {
    case "profile": {
      const current = readJson(
        studio.profileSettings,
        profileDefaultsFromOwner(owner, studio),
      );
      const next = { ...current, ...payload };
      const avatarValue = resolveProfileAvatar(payload.avatar ?? next.avatar);
      if (avatarValue) {
        next.avatar = avatarValue;
      }

      await prisma.$transaction([
        prisma.studio.update({
          where: { id: studio.id },
          data: {
            profileSettings: next,
            ...(avatarValue ? { avatarAssetKey: avatarValue } : {}),
          },
        }),
        prisma.user.update({
          where: { id: owner.id },
          data: {
            fullName:
              typeof payload.fullName === "string"
                ? payload.fullName
                : owner.fullName,
            ...(avatarValue ? { avatarUrl: avatarValue } : {}),
          },
        }),
      ]);

      await syncPhotographerIdentityAcrossRecords(photographerUserId, {
        ...(typeof payload.fullName === "string"
          ? { fullName: payload.fullName }
          : {}),
        ...(avatarValue ? { avatarUrl: avatarValue } : {}),
      });
      break;
    }
    case "studio": {
      const current = readJson(studio.brandSettings, brandDefaultsFromStudio(studio));
      const studioName =
        typeof payload.studioName === "string"
          ? payload.studioName
          : studio.name;
      const brandAccentColor =
        typeof payload.brandAccentColor === "string"
          ? payload.brandAccentColor
          : current.brandAccentColor;
      const specialization =
        typeof payload.specialization === "string"
          ? payload.specialization.trim()
          : typeof current.specialization === "string"
            ? current.specialization.trim()
            : "";
      const logoAssetKey =
        typeof payload.logoAssetKey === "string"
          ? normalizeStoredMediaUrl(loadEnv(), payload.logoAssetKey, "Studio logo")
          : typeof current.logoAssetKey === "string"
            ? current.logoAssetKey
            : "";
      const watermarkAssetKey =
        typeof payload.watermarkAssetKey === "string"
          ? normalizeStoredMediaUrl(
              loadEnv(),
              payload.watermarkAssetKey,
              "Gallery watermark",
            )
          : typeof current.watermarkAssetKey === "string"
            ? current.watermarkAssetKey
            : "";

      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          name: studioName,
          brandSettings: {
            ...current,
            studioName,
            brandAccentColor,
            specialization,
            logoAssetKey,
            watermarkAssetKey,
          },
        },
      });

      await syncPhotographerIdentityAcrossRecords(photographerUserId, {
        studioName,
      });
      break;
    }
    case "payment": {
      const current = readJson(studio.paymentProfile, {
        bankTransferEnabled: true,
        mobileMoneyEnabled: false,
        accountName: "",
        accountNumber: "",
        depositRequirement: "half" as const,
        momoAccountName: "",
        momoNumber: "",
        merchantCode: "",
        provider: "",
        referenceHint: "",
      });
      const next = { ...current, ...payload };

      if (next.mobileMoneyEnabled === true) {
        const momoAccountName =
          typeof next.momoAccountName === "string" ? next.momoAccountName.trim() : "";
        const momoNumber =
          typeof next.momoNumber === "string" ? next.momoNumber.trim() : "";
        if (!momoAccountName || !momoNumber) {
          throw new AppError(
            "Please enter your Mobile Money account name and number.",
            400,
          );
        }
      }

      if (next.bankTransferEnabled === true) {
        const accountName =
          typeof next.accountName === "string" ? next.accountName.trim() : "";
        const accountNumber =
          typeof next.accountNumber === "string" ? next.accountNumber.trim() : "";
        if (!accountName || !accountNumber) {
          throw new AppError(
            "Please enter your bank account name and number.",
            400,
          );
        }
      }

      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          paymentProfile: next,
        },
      });
      break;
    }
    case "notifications":
      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          notificationPrefs: {
            ...readJson(studio.notificationPrefs, DEFAULT_NOTIFICATION_PREFS),
            ...payload,
          },
        },
      });
      break;
    case "gallery":
      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          gallerySettings: {
            ...readJson(studio.gallerySettings, DEFAULT_GALLERY),
            ...payload,
          },
        },
      });
      break;
    case "booking": {
      const currentBrand = readJson(studio.brandSettings, brandDefaultsFromStudio(studio));
      const cancellationPolicy =
        typeof payload.cancellationPolicy === "string"
          ? payload.cancellationPolicy.trim()
          : readBookingSettings({
              brandSettings: studio.brandSettings,
              schedule,
            }).cancellationPolicy;

      const scheduleUpdates: Record<string, number> = {};
      if (typeof payload.maxDaysAhead === "number") {
        scheduleUpdates.maxDaysAhead = payload.maxDaysAhead;
      }
      if (typeof payload.slotIntervalMinutes === "number") {
        scheduleUpdates.slotIntervalMinutes = payload.slotIntervalMinutes;
      }
      if (typeof payload.bufferMinutes === "number") {
        scheduleUpdates.bufferMinutes = payload.bufferMinutes;
      }

      if (Object.keys(scheduleUpdates).length > 0) {
        await getOrCreateStudioSchedule(studio.id);
        await prisma.studioSchedule.update({
          where: { studioId: studio.id },
          data: scheduleUpdates,
        });
      }

      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          brandSettings: {
            ...currentBrand,
            bookingSettings: {
              cancellationPolicy,
            },
          },
        },
      });
      break;
    }
    case "security": {
      const current = readJson(studio.securitySettings, DEFAULT_SECURITY);

      if (
        typeof payload.newPassword === "string" &&
        payload.newPassword.trim().length > 0
      ) {
        const currentPassword =
          typeof payload.currentPassword === "string"
            ? payload.currentPassword
            : "";
        const confirmPassword =
          typeof payload.confirmPassword === "string"
            ? payload.confirmPassword
            : "";

        if (!currentPassword) {
          throw new AppError("Current password is required", 400);
        }

        if (payload.newPassword !== confirmPassword) {
          throw new AppError("New passwords do not match", 400);
        }

        const valid = await verifyPassword(currentPassword, owner.passwordHash);
        if (!valid) {
          throw new AppError("Current password is incorrect", 400);
        }

        const passwordHash = await hashPassword(payload.newPassword);
        await prisma.user.update({
          where: { id: owner.id },
          data: { passwordHash },
        });
        await invalidateUserTokens(owner.id);
      }

      await prisma.studio.update({
        where: { id: studio.id },
        data: { securitySettings: { ...current, twoFactorEnabled: false } },
      });
      break;
    }
    case "billing":
      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          billingSettings: {
            ...readJson(studio.billingSettings, DEFAULT_BILLING),
            ...payload,
          },
        },
      });
      break;
    default:
      throw new AppError("Unknown settings panel", 400);
  }

  return getPhotographerSettingsPanel(photographerUserId, panel);
}

const DEFAULT_CLIENT_SETTINGS = {
  phone: "",
  address: "",
  interests: [] as string[],
  skipped: false,
  notificationPrefs: {
    bookingUpdates: { email: true, sms: true, inApp: true },
    paymentUpdates: { email: true, sms: false, inApp: true },
    galleryUpdates: { email: true, sms: false, inApp: true },
  },
};

function readClientStoredSettings(value: unknown) {
  const stored = readJson(value, DEFAULT_CLIENT_SETTINGS);
  return {
    phone: typeof stored.phone === "string" ? stored.phone : "",
    address: typeof stored.address === "string" ? stored.address : "",
    interests: Array.isArray(stored.interests)
      ? stored.interests.filter((item): item is string => typeof item === "string")
      : [],
    skipped: stored.skipped === true,
    notificationPrefs: readJson(
      stored.notificationPrefs,
      DEFAULT_CLIENT_SETTINGS.notificationPrefs,
    ),
  };
}

export async function getClientSettings(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  const stored = readClientStoredSettings(user.clientSettings);

  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? stored.phone ?? "",
    address: stored.address ?? "",
    interests: stored.interests ?? [],
    avatarUrl: user.avatarUrl ?? "",
    notifications: stored.notificationPrefs,
  };
}

export async function updateClientSettings(
  clientUserId: string,
  payload: Record<string, unknown>,
) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  const stored = readClientStoredSettings(user.clientSettings);
  const fullName =
    typeof payload.fullName === "string" ? payload.fullName.trim() : user.fullName;
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : stored.phone;
  const address =
    typeof payload.address === "string" ? payload.address.trim() : stored.address;
  const interests = Array.isArray(payload.interests)
    ? payload.interests.filter((item): item is string => typeof item === "string")
    : stored.interests;
  const avatarUrl =
    typeof payload.avatarUrl === "string" && payload.avatarUrl.trim()
      ? normalizeStoredMediaUrl(loadEnv(), payload.avatarUrl, "Profile photo")
      : undefined;

  if (!fullName) {
    throw new AppError("Please enter your full name.", 400);
  }
  if (!phone) {
    throw new AppError("Please enter your phone number.", 400);
  }
  if (!address) {
    throw new AppError("Please enter your location.", 400);
  }
  if (interests.length === 0) {
    throw new AppError("Please select at least one specialty or interest.", 400);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName,
      phone,
      clientSettings: {
        ...(stored.skipped ? { skipped: true } : {}),
        phone,
        address,
        interests,
        notificationPrefs: stored.notificationPrefs,
      },
      ...(avatarUrl ? { avatarUrl } : {}),
    },
  });

  await syncClientProfileAcrossRecords(clientUserId, {
    fullName,
    phone,
    address,
    ...(avatarUrl ? { avatarUrl } : {}),
  });

  return getClientSettings(clientUserId);
}

export async function updateClientNotificationSettings(
  clientUserId: string,
  payload: Record<string, unknown>,
) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  const stored = readClientStoredSettings(user.clientSettings);
  const current = stored.notificationPrefs;
  const next = { ...current };

  for (const eventKey of Object.keys(current) as Array<keyof typeof current>) {
    const incoming = payload[eventKey];
    if (!incoming || typeof incoming !== "object") {
      continue;
    }

    const channels = incoming as Record<string, unknown>;
    next[eventKey] = {
      email:
        typeof channels.email === "boolean"
          ? channels.email
          : current[eventKey].email,
      sms:
        typeof channels.sms === "boolean" ? channels.sms : current[eventKey].sms,
      inApp:
        typeof channels.inApp === "boolean"
          ? channels.inApp
          : current[eventKey].inApp,
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      clientSettings: {
        ...(stored.skipped ? { skipped: true } : {}),
        phone: stored.phone || user.phone || "",
        address: stored.address,
        interests: stored.interests,
        notificationPrefs: next,
      },
    },
  });

  return getClientSettings(clientUserId);
}

export async function updateClientSecuritySettings(
  clientUserId: string,
  payload: Record<string, unknown>,
) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  const currentPassword =
    typeof payload.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword =
    typeof payload.newPassword === "string" ? payload.newPassword : "";
  const confirmPassword =
    typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

  if (!newPassword.trim()) {
    throw new AppError("New password is required", 400);
  }
  if (newPassword.length < 8) {
    throw new AppError("Password must be at least 8 characters", 400);
  }
  if (!currentPassword) {
    throw new AppError("Current password is required", 400);
  }
  if (newPassword !== confirmPassword) {
    throw new AppError("New passwords do not match", 400);
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Current password is incorrect", 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });
  await invalidateUserTokens(user.id);

  return { updated: true };
}
