import { apiClient } from "@/lib/api-client";
import { mapApiServicePackage } from "@/services/service-mapper";
import type {
  ApiServicePackage,
  CreateServiceInput,
  ServicePackage,
} from "@/types/domains/service";

type ListResponse = { data: ApiServicePackage[] };
type ItemResponse = { data: ApiServicePackage };

export const photographerServicesHttp = {
  async list(): Promise<ServicePackage[]> {
    const { data } = await apiClient.get<ListResponse>("/photographer/services");
    return data.data.map(mapApiServicePackage);
  },

  async getById(id: string): Promise<ServicePackage | undefined> {
    try {
      const { data } = await apiClient.get<ItemResponse>(`/photographer/services/${id}`);
      return mapApiServicePackage(data.data);
    } catch {
      return undefined;
    }
  },

  async create(input: CreateServiceInput): Promise<ServicePackage> {
    const { data } = await apiClient.post<ItemResponse>("/photographer/services", input);
    return mapApiServicePackage(data.data);
  },

  async update(id: string, input: Partial<CreateServiceInput>): Promise<ServicePackage> {
    const { data } = await apiClient.patch<ItemResponse>(
      `/photographer/services/${id}`,
      input,
    );
    return mapApiServicePackage(data.data);
  },

  async duplicate(id: string): Promise<ServicePackage> {
    const { data } = await apiClient.post<ItemResponse>(
      `/photographer/services/${id}/duplicate`,
    );
    return mapApiServicePackage(data.data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/photographer/services/${id}`);
  },
};
