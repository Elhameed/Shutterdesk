import type { Booking, BookingPaymentStatus, BookingStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  bookingPackageInclude,
  resolvePackageCoverImage,
  type BookingWithPackageCover,
} from "../../lib/package-cover.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { getCalendarAvailabilitySummary } from "../availability/availability.service.js";

type CalendarEventVariant =
  | "editorial"
  | "travel"
  | "wedding"
  | "product"
  | "confirmed"
  | "awaitingPayment"
  | "paid";

function mapBookingVariant(
  booking: Pick<Booking, "packageName" | "paymentStatus" | "status">,
): CalendarEventVariant {
  if (booking.paymentStatus === "paid") return "paid";
  if (booking.paymentStatus === "unpaid") return "awaitingPayment";
  if (booking.status === "confirmed") return "confirmed";

  const name = booking.packageName.toLowerCase();
  if (name.includes("wedding")) return "wedding";
  if (name.includes("product") || name.includes("commercial")) return "product";
  if (name.includes("portrait") || name.includes("headshot") || name.includes("editorial")) {
    return "editorial";
  }
  return "confirmed";
}

function formatUpcomingDateTime(date: Date, time: string) {
  const month = date
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const day = date.getDate();
  return `${month} ${day} • ${time}`;
}

export async function getPhotographerCalendar(
  photographerUserId: string,
  month: number,
  year: number,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const monthIndex = month - 1;

  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);

  const bookings = await prisma.booking.findMany({
    where: {
      studioId: studio.id,
      sessionAt: { gte: start, lte: end },
      status: { not: "cancelled" },
    },
    orderBy: { sessionAt: "asc" },
    include: bookingPackageInclude,
  });

  const now = new Date();
  const events = bookings.map((booking) => ({
    id: booking.id,
    day: booking.sessionAt.getDate(),
    label: `${booking.clientName} • ${booking.sessionTime}`,
    variant: mapBookingVariant(booking),
  }));

  const { blockedDays, manualBlockedDays, availability } =
    await getCalendarAvailabilitySummary(studio.id, month, year);

  const upcomingBookings = await prisma.booking.findMany({
    where: {
      studioId: studio.id,
      sessionAt: { gte: now },
      status: { in: ["pending", "confirmed"] },
    },
    orderBy: { sessionAt: "asc" },
    take: 3,
  });

  const upcomingNext = upcomingBookings.map((booking, index) => ({
    id: booking.id,
    clientName: booking.clientName,
    sessionType: booking.packageName,
    dateTime: formatUpcomingDateTime(booking.sessionAt, booking.sessionTime),
    status: mapShootStatus(booking.paymentStatus, booking.status),
    highlighted: index === 0,
  }));

  return {
    month: {
      label: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      monthIndex,
      year,
    },
    events,
    blockedDays,
    manualBlockedDays,
    today: {
      year: now.getFullYear(),
      monthIndex: now.getMonth(),
      day: now.getDate(),
    },
    availability,
    upcomingNext,
    sessions: bookings.map((booking) =>
      mapSessionSummary(booking as BookingWithPackageCover),
    ),
  };
}

function mapSessionSummary(booking: BookingWithPackageCover) {
  return {
    id: booking.id,
    year: booking.sessionAt.getFullYear(),
    monthIndex: booking.sessionAt.getMonth(),
    day: booking.sessionAt.getDate(),
    category: booking.packageName,
    clientNames: booking.clientName,
    status:
      booking.paymentStatus === "paid"
        ? ("paid" as const)
        : ("confirmed" as const),
    imageAssetKey: resolvePackageCoverImage(booking),
    time: booking.timeWindow ?? booking.sessionTime,
    package: booking.packageDetail,
    location: booking.venue ?? booking.city ?? "Kigali, Rwanda",
  };
}

function mapShootStatus(
  paymentStatus: BookingPaymentStatus,
  status: BookingStatus,
): "confirmed" | "awaitingPayment" | "paid" {
  if (paymentStatus === "paid") return "paid";
  if (paymentStatus === "unpaid") return "awaitingPayment";
  if (status === "confirmed") return "confirmed";
  return "awaitingPayment";
}
