import { apiClient } from "@/lib/api-client";
import type { ClientDashboardSummary } from "@/types/domains/dashboard";

type Response = { data: ClientDashboardSummary };

export const clientDashboardHttp = {
  async getSummary(): Promise<ClientDashboardSummary> {
    const { data } = await apiClient.get<Response>("/client/dashboard");
    return data.data;
  },
};
