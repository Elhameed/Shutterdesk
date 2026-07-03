import { apiClient } from "@/lib/api-client";
import { mapApiServicePackage } from "@/services/service-mapper";
import type { ApiServicePackage, ServicePackage } from "@/types/domains/service";

type ListResponse = { data: ApiServicePackage[] };

export const clientServicesHttp = {
  async listPublic(): Promise<ServicePackage[]> {
    const { data } = await apiClient.get<ListResponse>("/client/services");
    return data.data.map(mapApiServicePackage);
  },

  async listPublicByStudio(studioSlug: string): Promise<ServicePackage[]> {
    const { data } = await apiClient.get<ListResponse>(
      `/client/studios/${studioSlug}/services`,
    );
    return data.data.map(mapApiServicePackage);
  },
};
