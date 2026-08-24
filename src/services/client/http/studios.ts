import { apiClient } from "@/lib/api-client";

export type ClientStudioSummary = {
  slug: string;
  name: string;
  avatarAssetKey: string | null;
};

type Response = { data: ClientStudioSummary[] };

export const clientStudiosHttp = {
  async list(): Promise<ClientStudioSummary[]> {
    const { data } = await apiClient.get<Response>("/client/studios");
    return data.data;
  },
};

