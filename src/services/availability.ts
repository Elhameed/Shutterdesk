import { apiClient } from "@/lib/api-client";
import type {
  AvailabilityBlock,
  AvailabilitySlot,
  StudioSchedule,
} from "@/types/domains/availability";

type ScheduleResponse = {
  data: { schedule: StudioSchedule; blocks: AvailabilityBlock[] };
};

type ScheduleOnlyResponse = { data: StudioSchedule };
type BlockResponse = { data: AvailabilityBlock };
type DatesResponse = { data: { availableDates: string[] } };
type SlotsResponse = { data: { slots: AvailabilitySlot[] } };

export const photographerAvailabilityHttp = {
  async getSchedule() {
    const { data } = await apiClient.get<ScheduleResponse>(
      "/photographer/availability/schedule",
    );
    return data.data;
  },

  async updateSchedule(input: Partial<StudioSchedule>) {
    const { data } = await apiClient.patch<ScheduleOnlyResponse>(
      "/photographer/availability/schedule",
      input,
    );
    return data.data;
  },

  async blockDay(date: string, reason?: string) {
    const { data } = await apiClient.post<BlockResponse>(
      "/photographer/availability/blocks/day",
      { date, reason },
    );
    return data.data;
  },

  async deleteBlock(blockId: string) {
    await apiClient.delete(`/photographer/availability/blocks/${blockId}`);
  },

  async unblockDay(date: string) {
    await apiClient.delete("/photographer/availability/blocks/day", {
      params: { date },
    });
  },
};

export const clientAvailabilityHttp = {
  async getAvailableDates(
    studioSlug: string,
    packageId: string,
    month: number,
    year: number,
  ) {
    const { data } = await apiClient.get<DatesResponse>("/client/availability/dates", {
      params: { studioSlug, packageId, month, year },
    });
    return data.data.availableDates;
  },

  async getSlots(studioSlug: string, packageId: string, date: string) {
    const { data } = await apiClient.get<SlotsResponse>("/client/availability/slots", {
      params: { studioSlug, packageId, date },
    });
    return data.data.slots;
  },
};
