import { describe, expect, it } from "vitest";
import {
  buildPopularServices,
  buildRevenueSeries,
  formatTrendPercent,
  getBookingsActiveInPeriod,
  sumPaymentsInRange,
} from "../src/lib/analytics-aggregates.js";
import {
  getAnalyticsPeriod,
  parseAnalyticsDateRange,
} from "../src/lib/analytics-period.js";

describe("parseAnalyticsDateRange", () => {
  it("defaults to 30 days for unknown values", () => {
    expect(parseAnalyticsDateRange(undefined)).toBe("30");
    expect(parseAnalyticsDateRange("invalid")).toBe("30");
  });
});

describe("getAnalyticsPeriod", () => {
  it("builds a 30-day window with a matching previous period", () => {
    const now = new Date(2026, 5, 18, 15, 0, 0);
    const period = getAnalyticsPeriod("30", now);

    expect(period.start.getFullYear()).toBe(2026);
    expect(period.start.getMonth()).toBe(4);
    expect(period.start.getDate()).toBe(20);
    expect(period.end.getDate()).toBe(18);
    expect(period.previousEnd.getTime()).toBeLessThan(period.start.getTime());
  });
});

describe("formatTrendPercent", () => {
  it("computes period-over-period change", () => {
    expect(formatTrendPercent(120, 100)).toEqual({
      trend: "+20%",
      trendUp: true,
    });
    expect(formatTrendPercent(80, 100)).toEqual({
      trend: "-20%",
      trendUp: false,
    });
  });
});

describe("buildRevenueSeries", () => {
  it("groups approved payments into buckets", () => {
    const buckets = [
      {
        label: "Jun",
        start: new Date("2026-06-01T00:00:00Z"),
        end: new Date("2026-06-30T23:59:59Z"),
      },
    ];

    const series = buildRevenueSeries(
      [
        { amount: 150_000, paidAt: new Date("2026-06-10T10:00:00Z") },
        { amount: 335_000, paidAt: new Date("2026-06-15T10:00:00Z") },
      ],
      buckets,
    );

    expect(series).toEqual([
      { label: "Jun", bar: 485_000, line: 485_000 },
    ]);
    expect(
      sumPaymentsInRange(
        [
          { amount: 150_000, paidAt: new Date("2026-06-10T10:00:00Z") },
          { amount: 335_000, paidAt: new Date("2026-06-15T10:00:00Z") },
        ],
        buckets[0].start,
        buckets[0].end,
      ),
    ).toBe(485_000);
  });
});

describe("buildPopularServices", () => {
  it("ranks services by paid revenue share", () => {
    const bookings = [
      {
        id: "booking-1",
        clientId: "client-1",
        clientEmail: "one@example.com",
        packageName: "Wedding Photography",
        status: "confirmed",
        amountPaid: 300_000,
        packagePrice: 300_000,
        sessionAt: new Date("2026-07-01T10:00:00Z"),
      },
      {
        id: "booking-2",
        clientId: "client-2",
        clientEmail: "two@example.com",
        packageName: "Graduation Photoshoot",
        status: "confirmed",
        amountPaid: 185_000,
        packagePrice: 185_000,
        sessionAt: new Date("2026-07-05T10:00:00Z"),
      },
    ];

    const payments = [
      {
        amount: 300_000,
        paidAt: new Date("2026-06-10T10:00:00Z"),
        bookingId: "booking-1",
        clientEmail: "one@example.com",
        bookingTitle: "Wedding Photography",
      },
      {
        amount: 185_000,
        paidAt: new Date("2026-06-12T10:00:00Z"),
        bookingId: "booking-2",
        clientEmail: "two@example.com",
        bookingTitle: "Graduation Photoshoot",
      },
    ];

    const services = buildPopularServices(
      bookings,
      payments,
      new Date("2026-06-01T00:00:00Z"),
      new Date("2026-06-30T23:59:59Z"),
      [],
    );

    expect(services[0]?.name).toBe("Wedding Photography");
    expect(services[0]?.share).toBe(62);
    expect(services[1]?.share).toBe(38);
    expect(services[0]?.bookings).toBe(1);
  });
});

describe("getBookingsActiveInPeriod", () => {
  it("includes bookings with payments in range even when the session is later", () => {
    const bookings = [
      {
        id: "booking-1",
        clientId: "client-1",
        clientEmail: "one@example.com",
        packageName: "Wedding Photography",
        status: "confirmed",
        amountPaid: 300_000,
        packagePrice: 300_000,
        sessionAt: new Date("2026-07-01T10:00:00Z"),
      },
    ];

    const payments = [
      {
        amount: 300_000,
        paidAt: new Date("2026-06-10T10:00:00Z"),
        bookingId: "booking-1",
        clientEmail: "one@example.com",
        bookingTitle: "Wedding Photography",
      },
    ];

    const active = getBookingsActiveInPeriod(
      bookings,
      payments,
      new Date("2026-06-01T00:00:00Z"),
      new Date("2026-06-30T23:59:59Z"),
    );

    expect(active).toHaveLength(1);
  });
});
