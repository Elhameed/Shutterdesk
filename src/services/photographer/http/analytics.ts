import { apiClient } from "@/lib/api-client";
import type { PhotographerAnalyticsSummary } from "@/types/domains/analytics";

type Response = { data: PhotographerAnalyticsSummary };

export const photographerAnalyticsHttp = {
  async getSummary(
    range = "30",
  ): Promise<PhotographerAnalyticsSummary> {
    const { data } = await apiClient.get<Response>("/photographer/analytics", {
      params: { range },
    });
    return data.data;
  },
};
