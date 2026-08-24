import { apiClient } from "@/lib/api-client";
import type {
  ClientSecuritySettings,
  ClientSettings,
} from "@/types/domains/settings";

type Response = { data: ClientSettings };
type SecurityResponse = { data: { updated: boolean } };

export const clientSettingsHttp = {
  async get(): Promise<ClientSettings> {
    const { data } = await apiClient.get<Response>("/client/settings");
    return data.data;
  },

  async update(payload: Omit<ClientSettings, "email" | "notifications">): Promise<ClientSettings> {
    const { data } = await apiClient.patch<Response>("/client/settings", payload);
    return data.data;
  },

  async updateNotifications(
    notifications: ClientSettings["notifications"],
  ): Promise<ClientSettings> {
    const { data } = await apiClient.patch<Response>(
      "/client/settings/notifications",
      notifications,
    );
    return data.data;
  },

  async updateSecurity(payload: ClientSecuritySettings): Promise<void> {
    await apiClient.patch<SecurityResponse>("/client/settings/security", payload);
  },

  async deactivate(): Promise<void> {
    await apiClient.post("/client/settings/deactivate");
  },
};
