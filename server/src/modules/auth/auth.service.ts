import type { UserRole } from "@prisma/client";
import type { Env } from "../../config/env.js";
import { AppError } from "../../middleware/error-handler.js";
import { signAccessToken } from "../../lib/jwt.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import { toPublicUserWithOnboarding } from "../../lib/user-mapper.js";
import { invalidateUserTokens } from "../../lib/auth-session.js";

type RegisterInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
};

export async function registerUser(input: RegisterInput, env: Env) {
  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      phone,
      passwordHash,
      role: input.role ?? "photographer",
    },
  });

  const publicUser = await toPublicUserWithOnboarding(user);
  const token = signAccessToken(
    {
      userId: publicUser.userId,
      email: publicUser.email,
      role: publicUser.role,
      tokenVersion: user.tokenVersion,
    },
    env,
  );

  return { user: publicUser, token };
}

export async function loginUser(
  emailInput: string,
  password: string,
  env: Env,
) {
  const email = emailInput.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const publicUser = await toPublicUserWithOnboarding(user);
  const token = signAccessToken(
    {
      userId: publicUser.userId,
      email: publicUser.email,
      role: publicUser.role,
      tokenVersion: user.tokenVersion,
    },
    env,
  );

  return { user: publicUser, token };
}

export async function logoutUser(userId: string) {
  await invalidateUserTokens(userId);
  return { success: true };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  return toPublicUserWithOnboarding(user);
}
