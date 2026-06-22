import type { Studio } from "@prisma/client";
import { prisma } from "./prisma.js";
import { AppError } from "../middleware/error-handler.js";

export async function getStudioForPhotographer(userId: string): Promise<Studio> {
  const studio = await prisma.studio.findUnique({
    where: { ownerUserId: userId },
  });

  if (!studio) {
    throw new AppError(
      "No studio is linked to this photographer account. Contact support.",
      404,
    );
  }

  return studio;
}
