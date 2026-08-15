export type UserRole = "photographer" | "client";

export type User = {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
  needsOnboarding?: boolean;
};

export type ApiError = {
  message: string;
  statusCode?: number;
};
