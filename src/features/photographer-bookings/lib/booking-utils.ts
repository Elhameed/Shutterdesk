import type { BookingFilter } from "@/constants/photographer-bookings";
import type { Booking } from "@/types/domains/booking";

export function filterBookings(
  bookings: Booking[],
  filter: BookingFilter,
): Booking[] {
  if (filter === "all") return bookings;
  return bookings.filter((booking) => booking.status === filter);
}

export function getBookingFilterCounts(
  bookings: Booking[],
): Record<BookingFilter, number> {
  return {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };
}

export function searchBookings(bookings: Booking[], query: string): Booking[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return bookings;

  return bookings.filter(
    (booking) =>
      booking.clientName.toLowerCase().includes(normalized) ||
      booking.email.toLowerCase().includes(normalized) ||
      booking.packageName.toLowerCase().includes(normalized) ||
      booking.packageDetail.toLowerCase().includes(normalized),
  );
}
