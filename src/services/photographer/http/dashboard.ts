import { apiClient } from "@/lib/api-client";
import { mapApiPhotographerDashboard } from "@/services/dashboard-mapper";
import type { PhotographerDashboardSummary } from "@/types/domains/dashboard";

type Response = {
  data: Parameters<typeof mapApiPhotographerDashboard>[0];
};

export const photographerDashboardHttp = {
  async getSummary(): Promise<PhotographerDashboardSummary> {
    const { data } = await apiClient.get<Response>("/photographer/dashboard");
    return mapApiPhotographerDashboard(data.data);
  },
};
