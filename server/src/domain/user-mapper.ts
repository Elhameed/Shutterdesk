import type { User } from "@prisma/client";
import { resolveNeedsOnboarding } from "./onboarding-status.js";

import type { ApiUser } from "../contracts/user.js";

/** The server's historic name for the shared `ApiUser` contract. */
export type PublicUser = ApiUser;

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
