import { apiClient } from "@/lib/api-client";
import {
  mapApiBooking,
  mapApiBookingDetail,
} from "@/services/photographer/booking-mapper";
import type {
  ApiBooking,
  ApiBookingDetail,
  Booking,
  BookingDetail,
  BookingStatus,
} from "@/types/domains/booking";
import type { CreateBookingInput } from "@/services/photographer/types";

type ListResponse = { data: ApiBooking[] };
type ItemResponse = { data: ApiBooking };
type DetailResponse = { data: ApiBookingDetail };

export const photographerBookingsHttp = {
  async list(): Promise<Booking[]> {
    const { data } = await apiClient.get<ListResponse>("/photographer/bookings");
    return data.data.map(mapApiBooking);
  },

  async getById(id: string): Promise<Booking | undefined> {
    try {
      const { data } = await apiClient.get<ItemResponse>(`/photographer/bookings/${id}`);
      return mapApiBooking(data.data);
    } catch {
      return undefined;
    }
  },

  async getDetail(id: string): Promise<BookingDetail | undefined> {
    try {
      const { data } = await apiClient.get<DetailResponse>(
        `/photographer/bookings/${id}/detail`,
      );
      return mapApiBookingDetail(data.data);
    } catch {
      return undefined;
    }
  },

  async create(input: CreateBookingInput): Promise<Booking> {
    const { data } = await apiClient.post<ItemResponse>("/photographer/bookings", {
      clientId: input.clientId,
      clientName: input.clientName,
      email: input.email,
      avatarAssetKey: input.avatarAssetKey,
      servicePackageId: input.servicePackageId,
      packageName: input.packageName,
      packageDetail: input.packageDetail,
      date: input.date,
      time: input.time,
      packagePrice: input.packagePrice,
      venue: input.venue,
      locationNotes: input.locationNotes,
    });
    return mapApiBooking(data.data);
  },

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const { data } = await apiClient.patch<ItemResponse>(
      `/photographer/bookings/${id}/status`,
      { status },
    );
    return mapApiBooking(data.data);
  },

  async reschedule(
    id: string,
    input: { date: string; time: string },
  ): Promise<Booking> {
    const { data } = await apiClient.patch<ItemResponse>(
      `/photographer/bookings/${id}/reschedule`,
      input,
    );
    return mapApiBooking(data.data);
  },

  async setGalleryReleaseOverride(
    id: string,
    enabled: boolean,
  ): Promise<BookingDetail> {
    const { data } = await apiClient.patch<DetailResponse>(
      `/photographer/bookings/${id}/gallery-release-override`,
      { enabled },
    );
    return mapApiBookingDetail(data.data);
  },
};
