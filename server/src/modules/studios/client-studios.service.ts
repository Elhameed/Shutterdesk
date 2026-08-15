import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { toApiServicePackage } from "../services/services.mapper.js";

export type ApiClientStudio = {
  slug: string;
  name: string;
  avatarAssetKey: string | null;
};

async function getClientUser(clientUserId: string) {
  const user = await prisma.user.findUnique({ where: { id: clientUserId } });
  if (!user || user.role !== "client") {
    throw new AppError("Client account required", 403);
  }
  return user;
}

export async function listClientStudios(clientUserId: string): Promise<ApiClientStudio[]> {
  await getClientUser(clientUserId);

  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: "asc" },
  });

  return studios.map((studio) => ({
    slug: studio.slug,
    name: studio.name,
    avatarAssetKey: studio.avatarAssetKey ?? null,
  }));
}

export async function listClientStudioServices(
  clientUserId: string,
  studioSlug: string,
) {
  await getClientUser(clientUserId);

  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } });
  if (!studio) {
    throw new AppError("Studio not found", 404);
  }

  const packages = await prisma.servicePackage.findMany({
    where: { studioId: studio.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return packages.map(toApiServicePackage).filter((pkg) => pkg.badges.includes("public"));
}

