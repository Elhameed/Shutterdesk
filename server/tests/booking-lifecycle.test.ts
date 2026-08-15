import { describe, expect, it } from "vitest";
import {
  buildLifecycleContext,
  canPhotographerCancelBooking,
  resolveClientPrimaryAction,
  resolveLifecycleStage,
  resolvePhotographerPrimaryAction,
} from "../src/lib/booking-lifecycle.js";

const baseBooking = {
  status: "pending" as const,
  detailStatus: "pending",
  showVerifyPayment: false,
  amountPaid: 0,
  progressStep: 0,
  galleryStep: 0,
};

describe("booking lifecycle", () => {
  it("starts at awaiting_deposit for new pending bookings", () => {
    const stage = resolveLifecycleStage(baseBooking, buildLifecycleContext(null));
    expect(stage).toBe("awaiting_deposit");
  });

  it("moves to awaiting_verification when a receipt is pending review", () => {
    const stage = resolveLifecycleStage(
      { ...baseBooking, showVerifyPayment: true, detailStatus: "pendingVerification" },
      buildLifecycleContext("ver-1"),
    );
    expect(stage).toBe("awaiting_verification");
  });

  it("blocks cancellation once a deposit receipt is submitted", () => {
    const ctx = buildLifecycleContext("ver-1");
    expect(
      canPhotographerCancelBooking(
        { ...baseBooking, showVerifyPayment: true },
        ctx,
      ),
    ).toBe(false);
  });

  it("blocks cancellation after deposit is verified", () => {
    expect(
      canPhotographerCancelBooking(
        { ...baseBooking, amountPaid: 50_000, status: "confirmed", detailStatus: "confirmed" },
        buildLifecycleContext(null),
      ),
    ).toBe(false);
  });

  it("allows cancellation only before any deposit activity", () => {
    expect(canPhotographerCancelBooking(baseBooking, buildLifecycleContext(null))).toBe(
      true,
    );
  });

  it("exposes a single pay-deposit CTA for clients", () => {
    const ctx = buildLifecycleContext(null, [
      { id: "req-1", type: "deposit", status: "unpaid" },
    ]);
    const action = resolveClientPrimaryAction(
      "awaiting_deposit",
      "booking-1",
      ctx,
    );
    expect(action).toEqual({
      type: "link",
      label: "Pay deposit",
      href: "/client/payments/upload?booking=booking-1&payment=req-1",
      variant: "default",
    });
  });

  it("requires final balance after session completion before gallery work", () => {
    const stage = resolveLifecycleStage(
      {
        status: "completed",
        detailStatus: "completed",
        showVerifyPayment: false,
        amountPaid: 50_000,
        packagePrice: 100_000,
        paymentMeta: {},
        progressStep: 4,
        galleryStep: 0,
      },
      buildLifecycleContext(null, [
        { id: "req-balance", type: "balance", status: "unpaid" },
      ]),
    );
    expect(stage).toBe("awaiting_balance");
  });

  it("allows gallery workflow once the package is fully paid", () => {
    const stage = resolveLifecycleStage(
      {
        status: "completed",
        detailStatus: "completed",
        showVerifyPayment: false,
        amountPaid: 100_000,
        packagePrice: 100_000,
        paymentMeta: {},
        progressStep: 4,
        galleryStep: 0,
      },
      buildLifecycleContext(null),
    );
    expect(stage).toBe("session_completed");
  });

  it("exposes create-gallery CTA for completed sessions without a gallery", () => {
    const action = resolvePhotographerPrimaryAction(
      "session_completed",
      "booking-1",
      buildLifecycleContext(null),
      null,
    );
    expect(action).toEqual({
      type: "link",
      label: "Create gallery",
      href: "/photographer/galleries/new?booking=booking-1",
      variant: "default",
    });
  });
});
