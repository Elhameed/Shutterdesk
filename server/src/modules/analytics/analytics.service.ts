import { prisma } from "../../lib/prisma.js";
import {
  buildBookingsVolumeSeries,
  buildPopularServices,
  buildRevenueSeries,
  buildTopClients,
  conversionRateInPeriod,
  countBookingsInPeriod,
  countCompletedSessionsInPeriod,
  formatTrendPercent,
  getBookingsActiveInPeriod,
  sumPaymentsInRange,
} from "../../lib/analytics-aggregates.js";
import {
  buildDayBuckets,
  buildMonthBuckets,
  buildWeekBuckets,
  getAnalyticsPeriod,
  parseAnalyticsDateRange,
} from "../../lib/analytics-period.js";
import {
  aggregateClientMetrics,
  type ClientMetricsMap,
} from "../../lib/client-metrics.js";
import { formatRwf } from "../../lib/currency-format.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";

function countRepeatClients(
  periodMetrics: ClientMetricsMap,
  lifetimeMetrics: ClientMetricsMap,
) {
  const activeClientIds = [...periodMetrics.keys()];
  const repeatClients = activeClientIds.filter(
    (clientId) => (lifetimeMetrics.get(clientId)?.sessions ?? 0) > 1,
  ).length;

  return {
    repeatClients,
    repeatRate:
      activeClientIds.length > 0
        ? Math.round((repeatClients / activeClientIds.length) * 100)
        : 0,
  };
}

export async function getPhotographerAnalytics(
  photographerUserId: string,
  rangeInput?: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const range = parseAnalyticsDateRange(rangeInput);
  const period = getAnalyticsPeriod(range);
  const now = new Date();

  const [
    clients,
    paymentRecords,
    servicePackages,
    bookings,
  ] = await Promise.all([
    prisma.studioClient.findMany({
      where: { studioId: studio.id },
      select: { id: true, name: true, email: true, tier: true },
    }),
    prisma.paymentRecord.findMany({
      where: { studioId: studio.id, status: "approved" },
      select: {
        amount: true,
        paidAt: true,
        bookingId: true,
        clientEmail: true,
        bookingTitle: true,
      },
      orderBy: { paidAt: "asc" },
    }),
    prisma.servicePackage.findMany({
      where: { studioId: studio.id },
      select: { title: true },
      orderBy: { title: "asc" },
    }),
    prisma.booking.findMany({
      where: { studioId: studio.id },
      select: {
        id: true,
        clientId: true,
        clientEmail: true,
        packageName: true,
        status: true,
        amountPaid: true,
        packagePrice: true,
        sessionAt: true,
      },
    }),
  ]);

  const periodBookings = getBookingsActiveInPeriod(
    bookings,
    paymentRecords,
    period.start,
    period.end,
  );
  const previousBookings = getBookingsActiveInPeriod(
    bookings,
    paymentRecords,
    period.previousStart,
    period.previousEnd,
  );

  const periodMetrics = aggregateClientMetrics(clients, periodBookings);
  const lifetimeMetrics = aggregateClientMetrics(clients, bookings);

  const revenue = sumPaymentsInRange(
    paymentRecords,
    period.start,
    period.end,
  );
  const previousRevenue = sumPaymentsInRange(
    paymentRecords,
    period.previousStart,
    period.previousEnd,
  );

  const completedSessions = countCompletedSessionsInPeriod(
    bookings,
    paymentRecords,
    period.start,
    period.end,
    now,
  );
  const previousCompletedSessions = countCompletedSessionsInPeriod(
    bookings,
    paymentRecords,
    period.previousStart,
    period.previousEnd,
    now,
  );

  const conversionRate = conversionRateInPeriod(
    bookings,
    paymentRecords,
    period.start,
    period.end,
    now,
  );
  const previousConversionRate = conversionRateInPeriod(
    bookings,
    paymentRecords,
    period.previousStart,
    period.previousEnd,
    now,
  );

  const { repeatClients, repeatRate } = countRepeatClients(
    periodMetrics,
    lifetimeMetrics,
  );
  const { repeatClients: previousRepeatClients } = countRepeatClients(
    aggregateClientMetrics(clients, previousBookings),
    lifetimeMetrics,
  );

  const revenueTrend = formatTrendPercent(revenue, previousRevenue);
  const sessionsTrend = formatTrendPercent(
    completedSessions,
    previousCompletedSessions,
  );
  const repeatTrend = formatTrendPercent(repeatClients, previousRepeatClients);
  const conversionTrend = formatTrendPercent(
    conversionRate,
    previousConversionRate,
  );

  const monthlyBuckets = buildMonthBuckets(period.start, period.end);

  const weeklyBuckets =
    range === "7"
      ? buildDayBuckets(period.start, period.end)
      : buildWeekBuckets(period.start, period.end, range === "90" ? 8 : 4);

  const bookingsVolumeBuckets = buildWeekBuckets(period.start, period.end, 8);

  const revenueMonthlyData = buildRevenueSeries(paymentRecords, monthlyBuckets);
  const revenueWeeklyData = buildRevenueSeries(paymentRecords, weeklyBuckets);
  const bookingsVolumeData = buildBookingsVolumeSeries(
    bookings,
    paymentRecords,
    bookingsVolumeBuckets,
  );

  const totalBookings = countBookingsInPeriod(
    bookings,
    paymentRecords,
    period.start,
    period.end,
  );

  const popularServices = buildPopularServices(
    bookings,
    paymentRecords,
    period.start,
    period.end,
    servicePackages.map((pkg) => pkg.title),
  );

  const topClients = buildTopClients(
    clients,
    bookings,
    paymentRecords,
    period.start,
    period.end,
  );

  return {
    kpis: [
      {
        id: "revenue",
        labelKey: "totalRevenue" as const,
        value: formatRwf(revenue),
        trend: revenueTrend?.trend,
        trendUp: revenueTrend?.trendUp,
        icon: "banknote" as const,
      },
      {
        id: "sessions",
        labelKey: "sessionsCompleted" as const,
        value: String(completedSessions),
        trend: sessionsTrend?.trend,
        trendUp: sessionsTrend?.trendUp,
        icon: "camera" as const,
      },
      {
        id: "repeat",
        labelKey: "repeatClients" as const,
        value: String(repeatClients),
        subtext: repeatRate > 0 ? `${repeatRate}% rate` : undefined,
        trend: repeatTrend?.trend,
        trendUp: repeatTrend?.trendUp,
        icon: "userPlus" as const,
      },
      {
        id: "conversion",
        labelKey: "conversionRate" as const,
        value: `${conversionRate}%`,
        trend: conversionTrend?.trend,
        trendUp: conversionTrend?.trendUp,
        icon: "trending" as const,
      },
    ],
    revenueMonthlyData,
    revenueWeeklyData,
    bookingsVolumeData,
    totalBookings,
    popularServices,
    topClients,
  };
}
