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
} from "@/types/domains/booking";
import type { CreateClientBookingInput } from "@/services/client/types";

type ListResponse = { data: ApiBooking[] };
type ItemResponse = { data: ApiBooking };
type DetailResponse = { data: ApiBookingDetail };
type UpcomingResponse = { data: ApiBooking | null };
type GalleryResponse = { data: { galleryId: string | null } };

export const clientBookingsHttp = {
  async list(): Promise<Booking[]> {
    const { data } = await apiClient.get<ListResponse>("/client/bookings");
    return data.data.map(mapApiBooking);
  },

  async getById(id: string): Promise<Booking | undefined> {
    try {
      const { data } = await apiClient.get<ItemResponse>(`/client/bookings/${id}`);
      return mapApiBooking(data.data);
    } catch {
      return undefined;
    }
  },

  async getDetail(id: string): Promise<BookingDetail | undefined> {
    try {
      const { data } = await apiClient.get<DetailResponse>(`/client/bookings/${id}/detail`);
      return mapApiBookingDetail(data.data);
    } catch {
      return undefined;
    }
  },

  async getUpcoming(): Promise<Booking | undefined> {
    const { data } = await apiClient.get<UpcomingResponse>("/client/bookings/upcoming");
    return data.data ? mapApiBooking(data.data) : undefined;
  },

  async getGalleryIdForBooking(bookingId: string): Promise<string | undefined> {
    try {
      const { data } = await apiClient.get<GalleryResponse>(
        `/client/bookings/${bookingId}/gallery`,
      );
      return data.data.galleryId ?? undefined;
    } catch {
      return undefined;
    }
  },

  async create(input: CreateClientBookingInput): Promise<Booking> {
    const { data } = await apiClient.post<ItemResponse>("/client/bookings", input);
    return mapApiBooking(data.data);
  },
};

