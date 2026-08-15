import { describe, expect, it } from "vitest";
import { aggregateClientMetrics } from "../src/lib/client-metrics.js";

describe("aggregateClientMetrics", () => {
  const clients = [
    { id: "client-1", email: "one@example.com" },
    { id: "client-2", email: "two@example.com" },
  ];

  it("aggregates sessions, revenue, balance, and last booking per client", () => {
    const metrics = aggregateClientMetrics(clients, [
      {
        clientId: "client-1",
        clientEmail: "one@example.com",
        status: "confirmed",
        amountPaid: 150_000,
        packagePrice: 300_000,
        sessionAt: new Date("2026-06-01T10:00:00Z"),
      },
      {
        clientId: "client-1",
        clientEmail: "one@example.com",
        status: "completed",
        amountPaid: 300_000,
        packagePrice: 300_000,
        sessionAt: new Date("2026-06-15T10:00:00Z"),
      },
      {
        clientId: null,
        clientEmail: "two@example.com",
        status: "pending",
        amountPaid: 0,
        packagePrice: 200_000,
        sessionAt: new Date("2026-06-10T10:00:00Z"),
      },
    ]);

    expect(metrics.get("client-1")).toEqual({
      sessions: 2,
      revenue: 450_000,
      balance: 150_000,
      lastBookingAt: new Date("2026-06-15T10:00:00Z"),
    });

    expect(metrics.get("client-2")).toEqual({
      sessions: 1,
      revenue: 0,
      balance: 200_000,
      lastBookingAt: new Date("2026-06-10T10:00:00Z"),
    });
  });

  it("ignores cancelled bookings", () => {
    const metrics = aggregateClientMetrics(clients, [
      {
        clientId: "client-1",
        clientEmail: "one@example.com",
        status: "cancelled",
        amountPaid: 50_000,
        packagePrice: 300_000,
        sessionAt: new Date("2026-06-01T10:00:00Z"),
      },
    ]);

    expect(metrics.get("client-1")).toBeUndefined();
  });
});
