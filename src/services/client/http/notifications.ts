import { apiClient } from "@/lib/api-client";
import type { ClientNotification } from "@/types/domains/notification";

type ListResponse = { data: ClientNotification[] };
type ItemResponse = { data: ClientNotification };

export const clientNotificationsHttp = {
  async list(): Promise<ClientNotification[]> {
    const { data } = await apiClient.get<ListResponse>("/client/notifications");
    return data.data;
  },

  async markAllRead(): Promise<ClientNotification[]> {
    const { data } = await apiClient.patch<ListResponse>(
      "/client/notifications/read-all",
    );
    return data.data;
  },

  async markRead(id: string): Promise<ClientNotification[]> {
    await apiClient.patch<ItemResponse>(`/client/notifications/${id}/read`);
    return this.list();
  },
};
