import { createNotification, findClientUserForBooking } from "./notification-dispatch.js";
import { formatRwf } from "../format/currency-format.js";

/**
 * Client-facing notifications raised by booking lifecycle changes.
 *
 * These were four near-identical functions in bookings.service.ts that each
 * resolved the client user, bailed if there wasn't one, and called
 * createNotification with different copy. Keeping the copy in one table makes
 * the set reviewable and stops a fifth event being written a fifth way.
 */

type BookingForNotification = {
  id: string;
  clientUserId: string | null;
  clientEmail: string;
  packageName: string;
  sessionDateLabel: string;
  sessionTime: string;
};

type BalanceDueBooking = Pick<
  BookingForNotification,
  "id" | "clientUserId" | "clientEmail" | "packageName"
> & {
  packagePrice: number;
  amountPaid: number;
};

const CALENDAR_EVENT_METADATA = (bookingId: string) => ({
  icon: "calendar",
  priority: "high",
  primaryAction: {
    label: "View booking",
    href: `/client/bookings/${bookingId}`,
  },
});

type BookingEvent = "confirmed" | "cancelled" | "rescheduled";

const BOOKING_EVENT_COPY: Record<
  BookingEvent,
  { title: string; describe: (booking: BookingForNotification, studio: string) => string }
> = {
  confirmed: {
    title: "Booking confirmed",
    describe: (booking, studio) =>
      `${studio} confirmed your ${booking.packageName} session on ${booking.sessionDateLabel} at ${booking.sessionTime}.`,
  },
  cancelled: {
    title: "Booking cancelled",
    describe: (booking, studio) =>
      `${studio} cancelled your ${booking.packageName} session scheduled for ${booking.sessionDateLabel} at ${booking.sessionTime}.`,
  },
  rescheduled: {
    title: "Session rescheduled",
    describe: (booking, studio) =>
      `${studio} moved your ${booking.packageName} session to ${booking.sessionDateLabel} at ${booking.sessionTime}.`,
  },
};

export async function notifyClientOfBookingEvent(
  event: BookingEvent,
  booking: BookingForNotification,
  studioName: string,
) {
  const clientUser = await findClientUserForBooking(booking);
  if (!clientUser) {
    return;
  }

  const copy = BOOKING_EVENT_COPY[event];

  await createNotification({
    userId: clientUser.id,
    category: "booking",
    title: copy.title,
    description: copy.describe(booking, studioName),
    actionHref: `/client/bookings/${booking.id}`,
    metadata: CALENDAR_EVENT_METADATA(booking.id),
  });
}

/**
 * Kept separate from the table above: it is conditional on there being a
 * balance, and it is a payment notification rather than a calendar one.
 */
export async function notifyClientFinalBalanceDue(
  booking: BalanceDueBooking,
  studioName: string,
) {
  const remaining = booking.packagePrice - booking.amountPaid;
  if (remaining <= 0) {
    return;
  }

  const clientUser = await findClientUserForBooking(booking);
  if (!clientUser) {
    return;
  }

  await createNotification({
    userId: clientUser.id,
    category: "payment",
    title: "Final balance due",
    description: `${studioName} marked your ${booking.packageName} session complete. Pay the remaining ${formatRwf(remaining)} to unlock your gallery.`,
    actionHref: `/client/bookings/${booking.id}`,
    metadata: {
      icon: "payment",
      priority: "high",
      actionLabel: "viewDetails",
    },
  });
}
