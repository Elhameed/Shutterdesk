import { apiClient } from "@/lib/api-client";
import type { StudioNotification } from "@/types/domains/notification";

type ListResponse = { data: StudioNotification[] };

export const photographerNotificationsHttp = {
  async list(): Promise<StudioNotification[]> {
    const { data } = await apiClient.get<ListResponse>(
      "/photographer/notifications",
    );
    return data.data;
  },

  async markAllRead(): Promise<StudioNotification[]> {
    const { data } = await apiClient.patch<ListResponse>(
      "/photographer/notifications/read-all",
    );
    return data.data;
  },

  async markRead(id: string): Promise<StudioNotification[]> {
    await apiClient.patch(`/photographer/notifications/${id}/read`);
    return this.list();
  },
};
