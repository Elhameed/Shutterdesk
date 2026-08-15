import type { User } from "@prisma/client";
import { resolveNeedsOnboarding } from "./onboarding-status.js";

export type PublicUser = {
  userId: string;
  fullName: string;
  email: string;
  role: User["role"];
  phone: string | null;
  avatarUrl: string | null;
  needsOnboarding: boolean;
};

export function toPublicUser(
  user: User,
  needsOnboarding: boolean,
): PublicUser {
  return {
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    needsOnboarding,
  };
}

export async function toPublicUserWithOnboarding(user: User): Promise<PublicUser> {
  const needsOnboarding = await resolveNeedsOnboarding(user);
  return toPublicUser(user, needsOnboarding);
}
