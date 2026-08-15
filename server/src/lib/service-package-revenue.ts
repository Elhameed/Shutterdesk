import type { Booking } from "@prisma/client";
import { prisma } from "./prisma.js";

export type ServicePackageRevenueMap = Map<string, number>;

type BookingRevenueRow = Pick<
  Booking,
  "servicePackageId" | "amountPaid" | "status"
>;

export function aggregateServicePackageRevenue(
  bookings: BookingRevenueRow[],
): ServicePackageRevenueMap {
  const revenue = new Map<string, number>();

  for (const booking of bookings) {
    if (booking.status === "cancelled" || !booking.servicePackageId) {
      continue;
    }

    revenue.set(
      booking.servicePackageId,
      (revenue.get(booking.servicePackageId) ?? 0) + booking.amountPaid,
    );
  }

  return revenue;
}

export async function loadStudioServicePackageRevenue(
  studioId: string,
): Promise<ServicePackageRevenueMap> {
  const bookings = await prisma.booking.findMany({
    where: {
      studioId,
      status: { not: "cancelled" },
      servicePackageId: { not: null },
    },
    select: {
      servicePackageId: true,
      amountPaid: true,
      status: true,
    },
  });

  return aggregateServicePackageRevenue(bookings);
}

export function resolveServicePackageRevenue(
  servicePackageId: string,
  revenueMap: ServicePackageRevenueMap,
): number {
  return revenueMap.get(servicePackageId) ?? 0;
}
