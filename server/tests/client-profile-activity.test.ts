import { describe, expect, it } from "vitest";
import type { StudioClient } from "@prisma/client";
import {
  buildGalleries,
  buildInsights,
  buildInvoices,
  buildProjects,
  buildTimeline,
} from "../src/lib/client-profile-activity.js";

const baseClient = {
  id: "client-1",
  name: "Immaculée Niyonsaba",
  email: "immaculee@example.com",
  category: "wedding",
  createdAt: new Date("2024-10-01T10:00:00Z"),
} as StudioClient;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * `buildProjects` and `buildTimeline` classify a session by comparing
 * `sessionAt` against `new Date()`, so a fixture pinned to a literal date is a
 * time bomb: it asserts "upcoming" until that date passes and then fails
 * forever with no code change. This suite was pinned to 2026-07-15 and started
 * failing on 2026-07-15. Anchor session dates to the run instead.
 */
function daysFromNow(days: number) {
  return new Date(Date.now() + days * DAY_MS);
}

describe("client profile activity builders", () => {
  it("builds projects from bookings", () => {
    const projects = buildProjects(
      [
        {
          id: "booking-1",
          packageName: "Golden Hour Wedding",
          // Display-only; the builders classify on sessionAt, not this label.
          sessionDateLabel: "Jun 15, 2026",
          sessionTime: "10:00 AM",
          sessionAt: daysFromNow(30),
          status: "confirmed",
          servicePackage: { category: "wedding", coverAssetKey: "cover-1" },
          gallery: {
            id: "gallery-1",
            coverAssetKey: "gallery-cover",
            photoCount: 24,
          },
        },
      ] as never,
      baseClient,
    );

    expect(projects[0]).toMatchObject({
      bookingId: "booking-1",
      status: "upcoming",
      title: "Golden Hour Wedding",
      photoCount: 24,
      coverImage: "gallery-cover",
    });
  });

  it("builds invoices from payment requests", () => {
    const invoices = buildInvoices([
      {
        id: "req-1",
        invoiceRef: "INV-1001",
        bookingTitle: "Golden Hour Wedding",
        type: "deposit",
        amount: 150_000,
        status: "approved",
        createdAt: new Date("2026-05-10T10:00:00Z"),
      },
      {
        id: "req-2",
        invoiceRef: null,
        bookingTitle: "Portrait Session",
        type: "balance",
        amount: 80_000,
        status: "unpaid",
        createdAt: new Date("2026-05-12T10:00:00Z"),
      },
    ] as never);

    expect(invoices[0]?.status).toBe("paid");
    expect(invoices[1]?.status).toBe("pending");
  });

  it("builds timeline with onboarding, sessions, and payments", () => {
    const timeline = buildTimeline(
      baseClient,
      [
        {
          id: "booking-1",
          packageName: "Golden Hour Wedding",
          sessionDateLabel: "Jun 15, 2026",
          sessionTime: "10:00 AM",
          sessionAt: daysFromNow(30),
          status: "confirmed",
          servicePackage: null,
          gallery: null,
        },
      ] as never,
      [],
      [
        {
          id: "payment-1",
          amount: 150_000,
          bookingTitle: "Golden Hour Wedding",
          paidAt: new Date("2026-05-20T10:00:00Z"),
        },
      ],
    );

    expect(timeline.some((event) => event.type === "onboarded")).toBe(true);
    expect(timeline.some((event) => event.type === "payment")).toBe(true);
    expect(timeline.some((event) => event.type === "upcoming")).toBe(true);
  });

  it("computes insights from booking metrics", () => {
    const insights = buildInsights(
      baseClient,
      [
        { servicePackage: { category: "wedding", coverAssetKey: null } },
        { servicePackage: { category: "wedding", coverAssetKey: null } },
      ] as never,
      { sessions: 2, revenue: 300_000, balance: 0, lastBookingAt: null },
    );

    expect(insights.retention).toBe("Returning");
    expect(insights.favType).toBe("Wedding");
    expect(insights.avgValue).toBe(150_000);
  });

  it("builds galleries from gallery records", () => {
    const galleries = buildGalleries([
      {
        id: "gallery-12345678",
        title: "Wedding Highlights",
        photoCount: 42,
        coverAssetKey: "landing/gallery/wedding/gallery-wedding-couple",
        settings: null,
        status: "published",
        workflowStatus: "delivered",
      },
    ] as never);

    expect(galleries[0]).toMatchObject({
      id: "gallery-12345678",
      title: "Wedding Highlights",
      itemCount: 42,
      privacy: "public",
    });
  });
});
