import type { ClientCategory } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { loadEnv } from "../../config/env.js";
import {
  normalizeStoredMediaUrl,
} from "../../lib/cloudinary.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import {
  loadStudioServicePackageRevenue,
  resolveServicePackageRevenue,
} from "../../lib/service-package-revenue.js";
import { AppError } from "../../middleware/error-handler.js";
import {
  buildServiceMetadata,
  toApiServicePackage,
} from "./services.mapper.js";

type ServiceMetadata = {
  badges?: string[];
  photographers?: number;
  locationType?: string;
  editedPhotos?: number;
  revisions?: number;
  onlineGallery?: boolean;
  printDelivery?: boolean;
  commercialLicense?: boolean;
  includes?: string[];
  additionalNotes?: string;
  currency?: string;
};

type CreateServiceInput = {
  title?: string;
  description?: string;
  price?: number;
  depositPercent?: number;
  category?: ClientCategory;
  duration?: string;
  isActive?: boolean;
  isDraft?: boolean;
  coverAssetKey?: string;
  badges?: string[];
  photographers?: number;
  locationType?: string;
  editedPhotos?: number;
  revisions?: number;
  onlineGallery?: boolean;
  printDelivery?: boolean;
  commercialLicense?: boolean;
  includes?: string[];
  additionalNotes?: string;
};

type UpdateServiceInput = Partial<CreateServiceInput>;

const PUBLISHED_DEFAULT_COVER = "landing/gallery/wedding/gallery-wedding-couple";

export function resolveServiceCoverAssetKey(
  coverAssetKey: string | undefined,
  options: { isDraft?: boolean } = {},
): string | null {
  if (!coverAssetKey?.trim()) {
    return options.isDraft ? null : PUBLISHED_DEFAULT_COVER;
  }

  const env = loadEnv();
  if (coverAssetKey.startsWith("http")) {
    return normalizeStoredMediaUrl(env, coverAssetKey, "Cover image");
  }

  return coverAssetKey.replace(/^\//, "");
}

function resolveCoverAssetKey(
  coverAssetKey: string | undefined,
  options: { isDraft?: boolean } = {},
) {
  return resolveServiceCoverAssetKey(coverAssetKey, options);
}

function resolveCoverAssetKeyForUpdate(coverAssetKey?: string) {
  if (coverAssetKey === undefined) return undefined;
  if (!coverAssetKey.trim()) {
    throw new AppError("Cover image cannot be empty", 400);
  }

  const env = loadEnv();
  if (coverAssetKey.startsWith("http")) {
    return normalizeStoredMediaUrl(env, coverAssetKey, "Cover image");
  }

  return coverAssetKey.replace(/^\//, "");
}

function resolveMarketplaceBadges(
  isActive: boolean,
  badges: string[] = [],
): string[] {
  if (!isActive) {
    return badges.filter((badge) => badge !== "public");
  }

  return badges.includes("public") ? badges : ["public", ...badges];
}

export function resolveServiceBadges(
  isActive: boolean,
  options: {
    isDraft?: boolean;
    isArchived?: boolean;
    requestedBadges?: string[];
    currentBadges?: string[];
  } = {},
) {
  const { isDraft, isArchived, requestedBadges = [], currentBadges = [] } = options;
  const sourceBadges = requestedBadges.length > 0 ? requestedBadges : currentBadges;

  if (isArchived === true || sourceBadges.includes("archived")) {
    return ["archived"];
  }

  if (isDraft === true) {
    return ["draft"];
  }

  if (isDraft === false) {
    const publishedBadges = sourceBadges.filter((badge) => badge !== "draft");
    return isActive
      ? resolveMarketplaceBadges(true, publishedBadges)
      : publishedBadges.filter((badge) => badge !== "public");
  }

  if (!isActive) {
    if (sourceBadges.includes("draft")) {
      return sourceBadges.filter((badge) => badge !== "public");
    }
    return sourceBadges.filter(
      (badge) => badge !== "public" && badge !== "draft",
    );
  }

  const publishedBadges = sourceBadges.filter((badge) => badge !== "draft");
  return resolveMarketplaceBadges(true, publishedBadges);
}

function buildServiceMetadataForPackage(
  input: CreateServiceInput | UpdateServiceInput,
  isActive: boolean,
  currentMeta: ServiceMetadata = {},
) {
  const badges = resolveServiceBadges(isActive, {
    isDraft: input.isDraft,
    isArchived: input.badges?.includes("archived"),
    requestedBadges: input.badges,
    currentBadges: currentMeta.badges,
  });

  return buildServiceMetadata({
    ...currentMeta,
    ...input,
    badges,
  });
}

const DRAFT_PACKAGE_TITLE = "Untitled Package";

export async function listPhotographerServices(photographerUserId: string) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const [packages, revenueMap] = await Promise.all([
    prisma.servicePackage.findMany({
      where: { studioId: studio.id },
      orderBy: { createdAt: "asc" },
    }),
    loadStudioServicePackageRevenue(studio.id),
  ]);

  return packages.map((pkg) =>
    toApiServicePackage(
      pkg,
      resolveServicePackageRevenue(pkg.id, revenueMap),
    ),
  );
}

export async function getPhotographerService(
  photographerUserId: string,
  serviceId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const [pkg, revenueMap] = await Promise.all([
    prisma.servicePackage.findFirst({
      where: { id: serviceId, studioId: studio.id },
    }),
    loadStudioServicePackageRevenue(studio.id),
  ]);

  return pkg
    ? toApiServicePackage(pkg, resolveServicePackageRevenue(pkg.id, revenueMap))
    : null;
}

export async function createPhotographerService(
  photographerUserId: string,
  input: CreateServiceInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const isDraft = input.isDraft ?? false;
  const isActive = isDraft ? false : (input.isActive ?? true);
  const title = input.title?.trim() || DRAFT_PACKAGE_TITLE;

  const pkg = await prisma.servicePackage.create({
    data: {
      studioId: studio.id,
      title,
      description: input.description?.trim() ?? "",
      price: input.price ?? 0,
      depositPercent: input.depositPercent ?? 50,
      category: input.category ?? "portrait",
      duration: input.duration ?? "1hr",
      isActive,
      coverAssetKey: resolveCoverAssetKey(input.coverAssetKey, {
        isDraft,
      }),
      metadata: buildServiceMetadataForPackage(
        { ...input, isDraft },
        isActive,
      ),
    },
  });

  return toApiServicePackage(pkg);
}

export async function updatePhotographerService(
  photographerUserId: string,
  serviceId: string,
  input: UpdateServiceInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const existing = await prisma.servicePackage.findFirst({
    where: { id: serviceId, studioId: studio.id },
  });

  if (!existing) {
    throw new AppError("Service package not found", 404);
  }

  const currentMeta = (existing.metadata ?? {}) as ServiceMetadata;
  const isDraft =
    input.isDraft === true
      ? true
      : input.isDraft === false || input.isActive === true
        ? false
        : undefined;
  const isActive =
    isDraft === true ? false : (input.isActive ?? existing.isActive);

  const pkg = await prisma.servicePackage.update({
    where: { id: serviceId },
    data: {
      title: input.title?.trim() || existing.title,
      description: input.description?.trim(),
      price: input.price,
      depositPercent: input.depositPercent,
      category: input.category,
      duration: input.duration,
      isActive,
      coverAssetKey: resolveCoverAssetKeyForUpdate(input.coverAssetKey),
      metadata: buildServiceMetadataForPackage(
        { ...input, isDraft },
        isActive,
        currentMeta,
      ),
    },
  });

  return toApiServicePackage(pkg);
}

async function buildDuplicateTitle(studioId: string, title: string) {
  const normalized = title.replace(/ \(Copy(?: \d+)?\)$/i, "").trim();
  let candidate = `${normalized} (Copy)`;
  let suffix = 2;

  while (
    await prisma.servicePackage.findFirst({
      where: { studioId, title: candidate },
      select: { id: true },
    })
  ) {
    candidate = `${normalized} (Copy ${suffix})`;
    suffix += 1;
  }

  return candidate;
}

function duplicateMetadataFromPackage(meta: ServiceMetadata) {
  return {
    photographers: meta.photographers,
    locationType: meta.locationType,
    editedPhotos: meta.editedPhotos,
    revisions: meta.revisions,
    onlineGallery: meta.onlineGallery,
    printDelivery: meta.printDelivery,
    commercialLicense: meta.commercialLicense,
    includes: meta.includes,
    additionalNotes: meta.additionalNotes,
    currency: meta.currency,
  };
}

export async function duplicatePhotographerService(
  photographerUserId: string,
  serviceId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const existing = await prisma.servicePackage.findFirst({
    where: { id: serviceId, studioId: studio.id },
  });

  if (!existing) {
    throw new AppError("Service package not found", 404);
  }

  const currentMeta = (existing.metadata ?? {}) as ServiceMetadata;
  const title = await buildDuplicateTitle(studio.id, existing.title);

  const pkg = await prisma.servicePackage.create({
    data: {
      studioId: studio.id,
      title,
      description: existing.description,
      price: existing.price,
      depositPercent: existing.depositPercent,
      category: existing.category,
      duration: existing.duration,
      isActive: false,
      coverAssetKey: existing.coverAssetKey,
      metadata: buildServiceMetadataForPackage(
        {
          ...duplicateMetadataFromPackage(currentMeta),
          isDraft: true,
        },
        false,
        currentMeta,
      ),
    },
  });

  return toApiServicePackage(pkg, 0);
}

export async function deletePhotographerService(
  photographerUserId: string,
  serviceId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const existing = await prisma.servicePackage.findFirst({
    where: { id: serviceId, studioId: studio.id },
  });

  if (!existing) {
    throw new AppError("Service package not found", 404);
  }

  const activeBookings = await prisma.booking.count({
    where: {
      servicePackageId: serviceId,
      status: { in: ["pending", "confirmed"] },
    },
  });

  if (activeBookings > 0) {
    throw new AppError(
      "This package has active bookings and cannot be deleted. Complete or cancel those bookings first.",
      400,
    );
  }

  await prisma.servicePackage.delete({
    where: { id: serviceId },
  });

  return { deleted: true, id: serviceId };
}

export async function listPublicClientServices(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  const packages = await prisma.servicePackage.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return packages.map(toApiServicePackage).filter((pkg) => pkg.badges.includes("public"));
}

export async function listPublicClientServicesByStudioSlug(
  clientUserId: string,
  studioSlug: string,
) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }

  const studio = await prisma.studio.findUnique({
    where: { slug: studioSlug },
  });

  if (!studio) {
    throw new AppError("Studio not found", 404);
  }

  const packages = await prisma.servicePackage.findMany({
    where: { studioId: studio.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return packages.map(toApiServicePackage).filter((pkg) => pkg.badges.includes("public"));
}
