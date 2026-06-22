import type { UserRole } from "@prisma/client";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { loadEnv } from "../../config/env.js";
import { normalizeStoredMediaUrl } from "../../lib/cloudinary.js";
import { signAccessToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { slugify } from "../../lib/slug.js";
import { toPublicUserWithOnboarding } from "../../lib/user-mapper.js";

type PhotographerOnboardingInput = {
  businessName: string;
  specialization: string;
  bio: string;
  momoAccountName: string;
  momoNumber: string;
  profilePhotoName?: string;
  profilePhotoUrl?: string;
  qrCodeName?: string;
  qrCodeUrl?: string;
};

type PhotographerOnboardingDraft = {
  businessName?: string;
  specialization?: string;
  bio?: string;
  momoAccountName?: string;
  momoNumber?: string;
  profilePhotoName?: string;
  profilePhotoUrl?: string;
  qrCodeName?: string;
  qrCodeUrl?: string;
};

async function ensureUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let counter = 0;

  while (await prisma.studio.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${slugify(base)}-${counter}`;
  }

  return slug;
}

function buildPaymentProfile(input: {
  momoAccountName: string;
  momoNumber: string;
  businessName: string;
  qrCodeAssetKey?: string;
  qrCodeName?: string;
}) {
  const momoNumber = input.momoNumber.trim();
  const momoAccountName = input.momoAccountName.trim();

  return {
    provider: "MTN Mobile Money (MoMo)",
    mobileMoneyEnabled: momoNumber.length > 0,
    merchantCode: "",
    momoAccountName,
    momoNumber,
    bankTransferEnabled: false,
    accountName: input.businessName.trim(),
    accountNumber: "",
    referenceHint: "Please include your Booking ID in the reference.",
    depositRequirement: "half" as const,
    ...(input.qrCodeAssetKey
      ? {
          qrCodeAssetKey: input.qrCodeAssetKey,
          ...(input.qrCodeName ? { qrCodeName: input.qrCodeName } : {}),
        }
      : {}),
  };
}

async function createStudioForPhotographer(
  userId: string,
  businessName: string,
  options: {
    specialization?: string;
    bio?: string;
    momoAccountName?: string;
    momoNumber?: string;
    profilePhotoName?: string;
    profilePhotoUrl?: string;
    qrCodeName?: string;
    qrCodeUrl?: string;
  } = {},
) {
  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner) {
    throw new AppError("User not found", 404);
  }

  const name = businessName.trim() || `${owner.fullName} Photography`;
  const firstName = owner.fullName.split(" ")[0] ?? owner.fullName;
  const avatarKey =
    options.profilePhotoUrl?.trim()
      ? normalizeStoredMediaUrl(loadEnv(), options.profilePhotoUrl, "Profile photo")
      : undefined;
  const qrCodeAssetKey = options.qrCodeUrl?.trim()
    ? normalizeStoredMediaUrl(loadEnv(), options.qrCodeUrl, "Payment QR code")
    : undefined;

  const existing = await prisma.studio.findUnique({
    where: { ownerUserId: userId },
  });

  if (existing) {
    const currentProfile = (existing.profileSettings ?? {}) as Record<string, unknown>;
    const currentBrand = (existing.brandSettings ?? {}) as Record<string, unknown>;
    const currentPayment = (existing.paymentProfile ?? {}) as Record<string, unknown>;

    const nextProfile = {
      ...currentProfile,
      fullName: owner.fullName,
      displayName: firstName,
      email: owner.email,
      ...(options.bio !== undefined ? { bio: options.bio.trim() } : {}),
      ...(avatarKey ? { avatar: avatarKey, profilePhotoName: options.profilePhotoName } : {}),
    };

    const nextBrand = {
      ...currentBrand,
      studioName: name,
      ...(options.specialization !== undefined
        ? { specialization: options.specialization }
        : {}),
    };

    const nextPayment = buildPaymentProfile({
      businessName: name,
      momoAccountName:
        options.momoAccountName ??
        (typeof currentPayment.momoAccountName === "string"
          ? currentPayment.momoAccountName
          : name),
      momoNumber:
        options.momoNumber ??
        (typeof currentPayment.momoNumber === "string" ? currentPayment.momoNumber : owner.phone ?? ""),
      qrCodeAssetKey:
        qrCodeAssetKey ??
        (typeof currentPayment.qrCodeAssetKey === "string"
          ? currentPayment.qrCodeAssetKey
          : undefined),
      qrCodeName:
        options.qrCodeName ??
        (typeof currentPayment.qrCodeName === "string"
          ? currentPayment.qrCodeName
          : undefined),
    });

    const studio = await prisma.studio.update({
      where: { id: existing.id },
      data: {
        name,
        ...(avatarKey ? { avatarAssetKey: avatarKey } : {}),
        profileSettings: nextProfile,
        brandSettings: nextBrand,
        paymentProfile: {
          ...currentPayment,
          ...nextPayment,
        },
      },
    });

    if (avatarKey) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: avatarKey },
      });
    }

    return studio;
  }

  const slug = await ensureUniqueSlug(name);
  const resolvedAvatarKey = avatarKey ?? "app/user-avatar";

  return prisma.studio.create({
    data: {
      ownerUserId: userId,
      name,
      slug,
      avatarAssetKey: resolvedAvatarKey,
      paymentProfile: buildPaymentProfile({
        businessName: name,
        momoAccountName: options.momoAccountName ?? name,
        momoNumber: options.momoNumber ?? owner.phone ?? "",
        qrCodeAssetKey,
        qrCodeName: options.qrCodeName,
      }),
      profileSettings: {
        fullName: owner.fullName,
        displayName: firstName,
        bio: options.bio?.trim() ?? "",
        email: owner.email,
        instagram: "",
        website: `shutterdesk.rw/studios/${slug}`,
        avatar: resolvedAvatarKey,
        profilePhotoName: options.profilePhotoName,
      },
      brandSettings: {
        studioName: name,
        brandAccentColor: "#795900",
        specialization: options.specialization ?? "",
      },
      notificationPrefs: {
        newBooking: { email: true, sms: true, inApp: true },
        paymentReceived: { email: true, sms: true, inApp: true },
        galleryFavorites: { email: false, sms: false, inApp: true },
      },
      gallerySettings: {
        allowDownloads: true,
        passwordProtection: false,
        watermarkGridView: true,
        watermarkRemoveOnPaid: true,
        allowClientDisableWatermark: false,
      },
    },
  }).then(async (studio) => {
    if (avatarKey) {
      await prisma.user.update({
        where: { id: userId },
        data: { avatarUrl: avatarKey },
      });
    }
    return studio;
  });
}

export async function updateUserRole(
  userId: string,
  role: UserRole,
  env: Env,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const studio = await prisma.studio.findUnique({
    where: { ownerUserId: userId },
  });

  if (studio && role === "client") {
    throw new AppError(
      "Photographers with a studio cannot switch to the client role",
      400,
    );
  }

  const updated =
    user.role === role
      ? user
      : await prisma.user.update({
          where: { id: userId },
          data: { role },
        });

  const publicUser = await toPublicUserWithOnboarding(updated);
  const token = signAccessToken(
    {
      userId: publicUser.userId,
      email: publicUser.email,
      role: publicUser.role,
      tokenVersion: updated.tokenVersion,
    },
    env,
  );

  return { user: publicUser, token };
}

export async function completePhotographerOnboarding(
  userId: string,
  input: PhotographerOnboardingInput,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "photographer") {
    throw new AppError("Photographer account required", 403);
  }

  if (!input.businessName.trim()) {
    throw new AppError("Please enter your business name.", 400);
  }
  if (!input.specialization.trim()) {
    throw new AppError("Please select a specialization.", 400);
  }
  if (!input.bio.trim()) {
    throw new AppError("Please add a short bio.", 400);
  }
  if (!input.momoAccountName.trim() || !input.momoNumber.trim()) {
    throw new AppError("Please complete your payment details.", 400);
  }

  const studio = await createStudioForPhotographer(userId, input.businessName, {
    specialization: input.specialization,
    bio: input.bio,
    momoAccountName: input.momoAccountName,
    momoNumber: input.momoNumber,
    profilePhotoName: input.profilePhotoName,
    profilePhotoUrl: input.profilePhotoUrl,
    qrCodeName: input.qrCodeName,
    qrCodeUrl: input.qrCodeUrl,
  });

  return {
    studio: {
      id: studio.id,
      name: studio.name,
      slug: studio.slug,
    },
  };
}

export async function skipPhotographerOnboarding(
  userId: string,
  draft: PhotographerOnboardingDraft = {},
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "photographer") {
    throw new AppError("Photographer account required", 403);
  }

  const businessName =
    draft.businessName?.trim() || `${user.fullName} Photography`;

  const studio = await createStudioForPhotographer(userId, businessName, {
    specialization: draft.specialization,
    bio: draft.bio,
    momoAccountName: draft.momoAccountName,
    momoNumber: draft.momoNumber,
    profilePhotoName: draft.profilePhotoName,
    profilePhotoUrl: draft.profilePhotoUrl,
    qrCodeName: draft.qrCodeName,
    qrCodeUrl: draft.qrCodeUrl,
  });

  return {
    studio: {
      id: studio.id,
      name: studio.name,
      slug: studio.slug,
    },
  };
}

export async function skipClientOnboarding(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      clientSettings: {
        skipped: true,
        phone: user.phone ?? "",
        address: "",
        interests: [],
      },
    },
  });

  return { skipped: true };
}
