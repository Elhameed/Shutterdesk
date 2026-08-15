import jwt, { type SignOptions } from "jsonwebtoken";
import type { UserRole } from "@prisma/client";
import type { Env } from "../config/env.js";

export type JwtPayload = {
  userId: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
};

export function signAccessToken(payload: JwtPayload, env: Env) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string, env: Env): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  }) as JwtPayload;
}
