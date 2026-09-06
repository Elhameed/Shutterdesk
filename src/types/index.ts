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

export type ApiFieldError = {
  field: string;
  message: string;
};

export type ApiError = {
  message: string;
  statusCode?: number;
  /**
   * Per-field validation failures. The API returns these from every zod-guarded
   * route; they were previously absent from this type and read nowhere, so
   * every validation failure collapsed into one generic banner message.
   */
  errors?: ApiFieldError[];
};
