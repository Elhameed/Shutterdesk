import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

export type AuthResponse = {
  user: User;
  token: string;
};

export type MeResponse = {
  user: User;
};

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }),

  register: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: User["role"];
  }) => apiClient.post<AuthResponse>("/auth/register", payload),

  me: () => apiClient.get<MeResponse>("/auth/me"),

  updateRole: (role: User["role"]) =>
    apiClient.patch<AuthResponse>("/auth/me/role", { role }),

  logout: () => apiClient.post<{ success: boolean }>("/auth/logout"),
};
