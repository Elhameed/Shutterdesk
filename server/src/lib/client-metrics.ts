import type { Booking } from "@prisma/client";
import { prisma } from "./prisma.js";

export type ClientMetrics = {
  sessions: number;
  revenue: number;
  balance: number;
  lastBookingAt: Date | null;
};

export type ClientMetricsMap = Map<string, ClientMetrics>;

type ClientRef = {
  id: string;
  email: string;
};

type BookingMetricsRow = Pick<
  Booking,
  "clientId" | "clientEmail" | "amountPaid" | "packagePrice" | "sessionAt"
> & {
  status: string;
};

const emptyMetrics = (): ClientMetrics => ({
  sessions: 0,
  revenue: 0,
  balance: 0,
  lastBookingAt: null,
});

export function aggregateClientMetrics(
  clients: ClientRef[],
  bookings: BookingMetricsRow[],
): ClientMetricsMap {
  const emailToClientId = new Map(
    clients.map((client) => [client.email.toLowerCase(), client.id]),
  );
  const metrics = new Map<string, ClientMetrics>();

  function ensure(clientId: string) {
    let entry = metrics.get(clientId);
    if (!entry) {
      entry = emptyMetrics();
      metrics.set(clientId, entry);
    }
    return entry;
  }

  for (const booking of bookings) {
    if (booking.status === "cancelled") {
      continue;
    }

    const clientId =
      booking.clientId ?? emailToClientId.get(booking.clientEmail.toLowerCase());
    if (!clientId) {
      continue;
    }

    const entry = ensure(clientId);
    entry.sessions += 1;
    entry.revenue += booking.amountPaid;
    entry.balance += Math.max(0, booking.packagePrice - booking.amountPaid);

    if (!entry.lastBookingAt || booking.sessionAt > entry.lastBookingAt) {
      entry.lastBookingAt = booking.sessionAt;
    }
  }

  return metrics;
}

export async function loadStudioClientMetrics(
  studioId: string,
  clients: ClientRef[],
): Promise<ClientMetricsMap> {
  if (clients.length === 0) {
    return new Map();
  }

  const bookings = await prisma.booking.findMany({
    where: {
      studioId,
      status: { not: "cancelled" },
    },
    select: {
      clientId: true,
      clientEmail: true,
      status: true,
      amountPaid: true,
      packagePrice: true,
      sessionAt: true,
    },
  });

  return aggregateClientMetrics(clients, bookings);
}

export function resolveClientMetrics(
  clientId: string,
  metricsMap: ClientMetricsMap,
): ClientMetrics {
  return metricsMap.get(clientId) ?? emptyMetrics();
}
