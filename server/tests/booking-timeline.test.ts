import { describe, expect, it } from "vitest";
import { buildBookingActivityTimelineFromBooking } from "../src/lib/booking-timeline.js";

const baseBooking = {
  status: "pending" as const,
  detailStatus: "pending",
  showVerifyPayment: false,
  amountPaid: 0,
  packagePrice: 500_000,
  paymentMeta: {},
  sessionDateLabel: "Jul 13, 2026",
  sessionTime: "10:30 AM",
  requestedAt: new Date("2026-06-18T08:00:00Z"),
  progressStep: 0,
  galleryStep: 0,
  galleryId: null,
};

describe("buildBookingActivityTimelineFromBooking", () => {
  it("marks deposit due as current for new bookings", () => {
    const timeline = buildBookingActivityTimelineFromBooking(baseBooking);

    expect(timeline.find((step) => step.id === "created")?.state).toBe("completed");
    expect(timeline.find((step) => step.id === "deposit-due")?.state).toBe("current");
    expect(timeline.find((step) => step.id === "receipt-uploaded")?.state).toBe(
      "upcoming",
    );
  });

  it("advances past receipt upload when verification is pending", () => {
    const timeline = buildBookingActivityTimelineFromBooking(
      {
        ...baseBooking,
        showVerifyPayment: true,
        detailStatus: "pendingVerification",
        paymentMeta: {
          paymentDate: "Jun 19, 2026",
          verificationStatus: "pending",
        },
      },
      [],
      "verification-1",
    );

    expect(timeline.find((step) => step.id === "receipt-uploaded")?.state).toBe(
      "completed",
    );
    expect(timeline.find((step) => step.id === "awaiting-verification")?.state).toBe(
      "current",
    );
    expect(timeline.find((step) => step.id === "booking-confirmed")?.state).toBe(
      "upcoming",
    );
  });

  it("shows session scheduled after deposit is verified", () => {
    const timeline = buildBookingActivityTimelineFromBooking({
      ...baseBooking,
      status: "confirmed",
      detailStatus: "confirmed",
      amountPaid: 150_000,
      progressStep: 3,
      paymentMeta: {
        paymentDate: "Jun 20, 2026",
        verificationStatus: "verified",
      },
    });

    expect(timeline.find((step) => step.id === "booking-confirmed")?.state).toBe(
      "completed",
    );
    expect(timeline.find((step) => step.id === "session-scheduled")?.state).toBe(
      "current",
    );
  });

  it("shows final balance due after session completion with outstanding balance", () => {
    const timeline = buildBookingActivityTimelineFromBooking(
      {
        ...baseBooking,
        status: "completed",
        detailStatus: "completed",
        amountPaid: 150_000,
        progressStep: 4,
        paymentMeta: {
          sessionCompletedAt: "2026-07-01T12:00:00Z",
        },
      },
      [{ id: "balance-1", type: "balance", status: "unpaid" }],
    );

    expect(timeline.find((step) => step.id === "session-completed")?.state).toBe(
      "completed",
    );
    expect(timeline.find((step) => step.id === "final-balance-due")?.state).toBe(
      "current",
    );
  });

  it("shows gallery milestones when gallery is delivered", () => {
    const timeline = buildBookingActivityTimelineFromBooking({
      ...baseBooking,
      status: "completed",
      detailStatus: "completed",
      amountPaid: 500_000,
      progressStep: 4,
      galleryStep: 3,
      galleryId: "gallery-1",
      paymentMeta: {
        sessionCompletedAt: "2026-07-01T12:00:00Z",
        paymentDate: "Jul 2, 2026",
        verificationStatus: "verified",
      },
    });

    expect(timeline.find((step) => step.id === "gallery-delivered")?.state).toBe(
      "completed",
    );
    expect(timeline.find((step) => step.id === "booking-completed")?.state).toBe(
      "current",
    );
  });

  it("returns cancelled timeline for cancelled bookings", () => {
    const timeline = buildBookingActivityTimelineFromBooking({
      ...baseBooking,
      status: "cancelled",
      detailStatus: "cancelled",
    });

    expect(timeline).toHaveLength(2);
    expect(timeline[1]).toMatchObject({
      id: "cancelled",
      state: "current",
    });
  });
});
