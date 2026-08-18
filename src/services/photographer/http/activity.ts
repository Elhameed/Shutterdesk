import { apiClient } from "@/lib/api-client";
import type { PaginatedPhotographerActivities } from "@/types/domains/dashboard";

type ListResponse = {
  data: PaginatedPhotographerActivities;
};

export const photographerActivityHttp = {
  async list(input: {
    page?: number;
    limit?: number;
    type?: string;
    range?: string;
  } = {}): Promise<PaginatedPhotographerActivities> {
    const { data } = await apiClient.get<ListResponse>("/photographer/dashboard/activity", {
      params: {
        page: input.page ?? 1,
        limit: input.limit ?? 20,
        ...(input.type && input.type !== "all" ? { type: input.type } : {}),
        ...(input.range && input.range !== "all" ? { range: input.range } : {}),
      },
    });

    return data.data;
  },
};
