import type { TimeBucket } from "./analytics-period.js";

export type AnalyticsPaymentRow = {
  amount: number;
  paidAt: Date;
  bookingId: string;
  clientEmail: string;
  bookingTitle: string;
};

export type AnalyticsBookingRow = {
  id: string;
  clientId: string | null;
  clientEmail: string;
  packageName: string;
  status: string;
  amountPaid: number;
  packagePrice: number;
  sessionAt: Date;
};

export function formatTrendPercent(current: number, previous: number) {
  if (current === 0 && previous === 0) {
    return undefined;
  }

  if (previous === 0) {
    return { trend: "+100%", trendUp: true };
  }

  const change = ((current - previous) / previous) * 100;
  const rounded = Math.abs(change) < 0.05 ? 0 : Number(change.toFixed(1));

  if (rounded === 0) {
    return { trend: "0%", trendUp: true };
  }

  return {
    trend: `${rounded > 0 ? "+" : ""}${rounded}%`,
    trendUp: rounded >= 0,
  };
}

export function sumPaymentsInRange(
  records: Array<Pick<AnalyticsPaymentRow, "amount" | "paidAt">>,
  start: Date,
  end: Date,
) {
  return records
    .filter((record) => record.paidAt >= start && record.paidAt <= end)
    .reduce((sum, record) => sum + record.amount, 0);
}

export function getPaymentBookingIdsInRange(
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
) {
  return new Set(
    payments
      .filter((payment) => payment.paidAt >= start && payment.paidAt <= end)
      .map((payment) => payment.bookingId),
  );
}

export function getBookingsActiveInPeriod(
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
) {
  const paidBookingIds = getPaymentBookingIdsInRange(payments, start, end);

  return bookings.filter(
    (booking) =>
      booking.status !== "cancelled" &&
      ((booking.sessionAt >= start && booking.sessionAt <= end) ||
        paidBookingIds.has(booking.id)),
  );
}

export function countCompletedSessionsInPeriod(
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
  now: Date,
) {
  return getBookingsActiveInPeriod(bookings, payments, start, end).filter(
    (booking) =>
      booking.status === "completed" ||
      (booking.status === "confirmed" && booking.sessionAt <= now),
  ).length;
}

export function countBookingsInPeriod(
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
) {
  return getBookingsActiveInPeriod(bookings, payments, start, end).length;
}

export function conversionRateInPeriod(
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
  now: Date,
) {
  const activeBookings = getBookingsActiveInPeriod(
    bookings,
    payments,
    start,
    end,
  );
  if (activeBookings.length === 0) {
    return 0;
  }

  const completed = activeBookings.filter(
    (booking) =>
      booking.status === "completed" ||
      (booking.status === "confirmed" && booking.sessionAt <= now),
  ).length;

  return Number(((completed / activeBookings.length) * 100).toFixed(1));
}

export function buildRevenueSeries(
  records: Array<Pick<AnalyticsPaymentRow, "amount" | "paidAt">>,
  buckets: TimeBucket[],
) {
  let cumulative = 0;

  return buckets.map((bucket) => {
    const amount = records
      .filter(
        (record) =>
          record.paidAt >= bucket.start && record.paidAt <= bucket.end,
      )
      .reduce((sum, record) => sum + record.amount, 0);

    cumulative += amount;

    return {
      label: bucket.label,
      bar: amount,
      line: cumulative,
    };
  });
}

export function buildBookingsVolumeSeries(
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  buckets: TimeBucket[],
) {
  return buckets.map((bucket) => {
    const matchedBookingIds = new Set<string>();

    for (const booking of bookings) {
      if (booking.status === "cancelled") {
        continue;
      }

      if (
        booking.sessionAt >= bucket.start &&
        booking.sessionAt <= bucket.end
      ) {
        matchedBookingIds.add(booking.id);
      }
    }

    for (const payment of payments) {
      if (payment.paidAt >= bucket.start && payment.paidAt <= bucket.end) {
        matchedBookingIds.add(payment.bookingId);
      }
    }

    return {
      label: bucket.label,
      value: matchedBookingIds.size,
    };
  });
}

export function buildPopularServices(
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
  fallbackNames: string[],
) {
  const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]));
  const packageStats = new Map<string, { bookings: Set<string>; revenue: number }>();

  for (const payment of payments) {
    if (payment.paidAt < start || payment.paidAt > end) {
      continue;
    }

    const booking = bookingsById.get(payment.bookingId);
    const name = booking?.packageName ?? payment.bookingTitle;
    const current = packageStats.get(name) ?? {
      bookings: new Set<string>(),
      revenue: 0,
    };
    current.bookings.add(payment.bookingId);
    current.revenue += payment.amount;
    packageStats.set(name, current);
  }

  for (const booking of getBookingsActiveInPeriod(
    bookings,
    payments,
    start,
    end,
  )) {
    const current = packageStats.get(booking.packageName) ?? {
      bookings: new Set<string>(),
      revenue: 0,
    };
    current.bookings.add(booking.id);
    packageStats.set(booking.packageName, current);
  }

  const totalRevenue = [...packageStats.values()].reduce(
    (sum, stat) => sum + stat.revenue,
    0,
  );

  const ranked = [...packageStats.entries()]
    .sort(
      (a, b) =>
        b[1].revenue - a[1].revenue || b[1].bookings.size - a[1].bookings.size,
    )
    .slice(0, 3)
    .map(([name, stat]) => ({
      name,
      bookings: stat.bookings.size,
      share:
        totalRevenue > 0
          ? Math.round((stat.revenue / totalRevenue) * 100)
          : 0,
    }));

  if (ranked.length > 0) {
    return ranked;
  }

  return fallbackNames.slice(0, 3).map((name) => ({
    name,
    bookings: 0,
    share: 0,
  }));
}

type ClientRef = {
  id: string;
  email: string;
  name: string;
  tier: string;
};

export function buildTopClients(
  clients: ClientRef[],
  bookings: AnalyticsBookingRow[],
  payments: AnalyticsPaymentRow[],
  start: Date,
  end: Date,
) {
  const emailToClientId = new Map(
    clients.map((client) => [client.email.toLowerCase(), client.id]),
  );
  const spentByClientId = new Map<string, number>();
  const sessionsByClientId = new Map<string, number>();
  const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]));

  for (const payment of payments) {
    if (payment.paidAt < start || payment.paidAt > end) {
      continue;
    }

    const booking = bookingsById.get(payment.bookingId);
    const clientId =
      booking?.clientId ??
      emailToClientId.get(payment.clientEmail.toLowerCase());
    if (!clientId) {
      continue;
    }

    spentByClientId.set(
      clientId,
      (spentByClientId.get(clientId) ?? 0) + payment.amount,
    );
  }

  for (const booking of getBookingsActiveInPeriod(
    bookings,
    payments,
    start,
    end,
  )) {
    const clientId =
      booking.clientId ??
      emailToClientId.get(booking.clientEmail.toLowerCase());
    if (!clientId) {
      continue;
    }

    sessionsByClientId.set(
      clientId,
      (sessionsByClientId.get(clientId) ?? 0) + 1,
    );
  }

  return clients
    .map((client) => ({
      id: client.id,
      initials: client.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      name: client.name,
      sessions: sessionsByClientId.get(client.id) ?? 0,
      spent: spentByClientId.get(client.id) ?? 0,
      status: statusForClient(client.tier, sessionsByClientId.get(client.id) ?? 0),
    }))
    .filter((client) => client.sessions > 0 || client.spent > 0)
    .sort((a, b) => b.spent - a.spent || b.sessions - a.sessions)
    .slice(0, 3);
}

function statusForClient(tier: string, sessions: number) {
  if (sessions >= 5) return "highValue" as const;
  if (tier === "vip") return "goldStatus" as const;
  return "loyalMember" as const;
}
