import type { Booking } from "@prisma/client";
import { formatDisplayDate } from "./date-format.js";
import {
  buildLifecycleContext,
  resolveLifecycleStage,
  type BookingLifecycleStage,
  type LifecycleContext,
} from "./booking-lifecycle.js";

export type BookingTimelineStep = {
  id: string;
  title: string;
  timestamp: string;
  state: "completed" | "current" | "upcoming";
  note?: string;
  attachment?: string;
};

type BookingTimelineInput = Pick<
  Booking,
  | "status"
  | "detailStatus"
  | "showVerifyPayment"
  | "amountPaid"
  | "packagePrice"
  | "paymentMeta"
  | "sessionDateLabel"
  | "sessionTime"
  | "requestedAt"
  | "progressStep"
  | "galleryStep"
> & {
  galleryId: string | null;
};

type MilestoneTemplate = {
  id: string;
  title: string;
  timestamp: (booking: BookingTimelineInput, meta: Record<string, unknown>) => string;
  note?: (
    booking: BookingTimelineInput,
    meta: Record<string, unknown>,
    stage: BookingLifecycleStage,
  ) => string | undefined;
  include?: (booking: BookingTimelineInput, stage: BookingLifecycleStage) => boolean;
};

function readMeta(paymentMeta: unknown): Record<string, unknown> {
  if (!paymentMeta || typeof paymentMeta !== "object") {
    return {};
  }
  return paymentMeta as Record<string, unknown>;
}

function resolveCurrentMilestoneId(
  stage: BookingLifecycleStage,
  booking: BookingTimelineInput,
): string {
  switch (stage) {
    case "awaiting_deposit":
      return "deposit-due";
    case "awaiting_verification":
      return "awaiting-verification";
    case "confirmed":
      return "booking-confirmed";
    case "session_scheduled":
      return "session-scheduled";
    case "awaiting_balance":
      return "final-balance-due";
    case "session_completed":
      if (booking.galleryId) {
        return "gallery-created";
      }
      if (booking.amountPaid < booking.packagePrice) {
        return "final-balance-due";
      }
      return "session-completed";
    case "gallery_delivery":
      return booking.amountPaid >= booking.packagePrice
        ? "booking-completed"
        : "gallery-delivered";
    case "cancelled":
      return "cancelled";
    default:
      return "deposit-due";
  }
}

const MILESTONES: MilestoneTemplate[] = [
  {
    id: "created",
    title: "Booking Created",
    timestamp: (booking) =>
      `${formatDisplayDate(booking.requestedAt)} • ${booking.sessionTime}`,
  },
  {
    id: "deposit-due",
    title: "Deposit Due",
    timestamp: () => "Pending payment",
    note: () => "Upload your MoMo receipt after paying the studio.",
  },
  {
    id: "receipt-uploaded",
    title: "Receipt Uploaded",
    timestamp: (_booking, meta) =>
      typeof meta.paymentDate === "string" ? meta.paymentDate : "Submitted",
    note: () => "Receipt submitted for verification.",
  },
  {
    id: "awaiting-verification",
    title: "Awaiting Verification",
    timestamp: () => "In review",
    note: () => "The studio is reviewing your payment receipt.",
  },
  {
    id: "booking-confirmed",
    title: "Booking Confirmed",
    timestamp: (_booking, meta) =>
      typeof meta.paymentDate === "string" ? meta.paymentDate : "Confirmed",
    note: (_booking, meta) =>
      typeof meta.note === "string" && meta.verificationStatus === "verified"
        ? meta.note
        : "Deposit verified — your session is confirmed.",
  },
  {
    id: "session-scheduled",
    title: "Session Scheduled",
    timestamp: (booking) => `${booking.sessionDateLabel} • ${booking.sessionTime}`,
  },
  {
    id: "session-completed",
    title: "Session Completed",
    timestamp: (_booking, meta) =>
      typeof meta.sessionCompletedAt === "string"
        ? formatDisplayDate(new Date(meta.sessionCompletedAt))
        : "Completed",
    include: (booking) =>
      booking.status === "completed" || booking.detailStatus === "completed",
  },
  {
    id: "final-balance-due",
    title: "Final Balance Due",
    timestamp: () => "Outstanding balance",
    note: () => "Pay the remaining balance to unlock gallery delivery.",
    include: (booking, stage) =>
      stage === "awaiting_balance" ||
      (booking.amountPaid > 0 && booking.amountPaid < booking.packagePrice),
  },
  {
    id: "final-payment-received",
    title: "Final Payment Received",
    timestamp: (_booking, meta) =>
      typeof meta.paymentDate === "string" ? meta.paymentDate : "Paid in full",
    include: (booking) => booking.amountPaid >= booking.packagePrice,
  },
  {
    id: "gallery-created",
    title: "Gallery Created",
    timestamp: () => "Gallery linked to booking",
    include: (booking) => Boolean(booking.galleryId),
  },
  {
    id: "gallery-delivered",
    title: "Gallery Delivered",
    timestamp: () => "Delivered to client",
    include: (booking) => booking.galleryStep >= 3,
  },
  {
    id: "booking-completed",
    title: "Booking Completed",
    timestamp: () => "All milestones complete",
    include: (booking) =>
      booking.galleryStep >= 3 && booking.amountPaid >= booking.packagePrice,
  },
];

export function buildBookingActivityTimeline(
  booking: BookingTimelineInput,
  ctx: LifecycleContext,
): BookingTimelineStep[] {
  const meta = readMeta(booking.paymentMeta);
  const stage = resolveLifecycleStage(booking, ctx);

  if (stage === "cancelled") {
    return [
      {
        id: "created",
        title: "Booking Created",
        timestamp: `${formatDisplayDate(booking.requestedAt)} • ${booking.sessionTime}`,
        state: "completed",
      },
      {
        id: "cancelled",
        title: "Booking Cancelled",
        timestamp: "Cancelled",
        state: "current",
      },
    ];
  }

  const visibleMilestones = MILESTONES.filter(
    (milestone) => milestone.include?.(booking, stage) ?? true,
  );

  const currentMilestoneId = resolveCurrentMilestoneId(stage, booking);
  const currentIndex = visibleMilestones.findIndex(
    (milestone) => milestone.id === currentMilestoneId,
  );
  const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  return visibleMilestones.map((milestone, index) => {
    let state: BookingTimelineStep["state"];

    if (index < safeCurrentIndex) {
      state = "completed";
    } else if (index === safeCurrentIndex) {
      state = "current";
    } else {
      state = "upcoming";
    }

    return {
      id: milestone.id,
      title: milestone.title,
      timestamp: milestone.timestamp(booking, meta),
      state,
      note: milestone.note?.(booking, meta, stage),
    };
  });
}

export function buildBookingActivityTimelineFromBooking(
  booking: BookingTimelineInput,
  unpaidRequests: Array<{ id: string; type: string; status: string }> = [],
  pendingVerificationId: string | null = null,
): BookingTimelineStep[] {
  const ctx = buildLifecycleContext(
    pendingVerificationId,
    unpaidRequests.map((request) => ({
      id: request.id,
      type: request.type,
      status: request.status,
    })),
  );

  return buildBookingActivityTimeline(booking, ctx);
}
