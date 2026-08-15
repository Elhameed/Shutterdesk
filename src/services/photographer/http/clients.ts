import { apiClient } from "@/lib/api-client";
import {
  mapApiClientToClient,
  mapApiProfileToDetail,
} from "@/services/photographer/client-mapper";
import type {
  ApiClientProfile,
  ApiStudioClient,
  Client,
  ClientProfileDetail,
} from "@/types/domains/photographer-client";
import type { AddClientInput } from "@/services/photographer/types";

type ListResponse = { data: ApiStudioClient[] };
type ItemResponse = { data: ApiStudioClient };
type ProfileResponse = { data: ApiClientProfile };

export const photographerClientsHttp = {
  async list(): Promise<Client[]> {
    const { data } = await apiClient.get<ListResponse>("/photographer/clients");
    return data.data.map(mapApiClientToClient);
  },

  async add(input: AddClientInput): Promise<Client> {
    const { data } = await apiClient.post<ItemResponse>("/photographer/clients", input);
    return mapApiClientToClient(data.data);
  },

  async getById(id: string): Promise<Client | null> {
    try {
      const { data } = await apiClient.get<ItemResponse>(`/photographer/clients/${id}`);
      return mapApiClientToClient(data.data);
    } catch {
      return null;
    }
  },

  async getProfile(id: string): Promise<ClientProfileDetail | null> {
    const { data } = await apiClient.get<ProfileResponse>(
      `/photographer/clients/${id}/profile`,
    );
    return mapApiProfileToDetail(data.data);
  },

  async updateNotes(id: string, notes: string): Promise<string | null> {
    try {
      const { data } = await apiClient.patch<{ data: { notes: string | null } }>(
        `/photographer/clients/${id}/notes`,
        { notes },
      );
      return data.data.notes;
    } catch {
      return null;
    }
  },
};
