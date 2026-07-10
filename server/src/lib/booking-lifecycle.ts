import type { Booking } from "@prisma/client";

export type BookingLifecycleStage =
  | "awaiting_deposit"
  | "awaiting_verification"
  | "confirmed"
  | "awaiting_balance"
  | "session_scheduled"
  | "session_completed"
  | "gallery_delivery"
  | "cancelled";

export type UnpaidRequestSnapshot = {
  type: string;
  status: string;
  id: string;
};

export type LifecycleContext = {
  pendingVerificationId: string | null;
  unpaidRequests: UnpaidRequestSnapshot[];
};

export type LifecyclePrimaryAction =
  | {
      type: "link";
      label: string;
      href: string;
      variant: "default" | "outline";
    }
  | {
      type: "markComplete";
      label: string;
      variant: "default" | "outline";
    };

function firstUnpaid(
  requests: UnpaidRequestSnapshot[],
  type: "deposit" | "balance" | "full",
) {
  return requests.find(
    (request) => request.type === type && request.status === "unpaid",
  );
}

function hasOutstandingBalance(
  booking: Pick<Booking, "packagePrice" | "amountPaid" | "paymentMeta">,
) {
  if (booking.amountPaid >= booking.packagePrice) {
    return false;
  }

  const paymentMeta =
    booking.paymentMeta && typeof booking.paymentMeta === "object"
      ? (booking.paymentMeta as { galleryReleaseOverride?: boolean })
      : null;

  return paymentMeta?.galleryReleaseOverride !== true;
}

function isSessionCompleted(booking: Pick<Booking, "status" | "detailStatus">) {
  return booking.status === "completed" || booking.detailStatus === "completed";
}

export function buildLifecycleContext(
  pendingVerificationId: string | null,
  unpaidRequests: UnpaidRequestSnapshot[] = [],
): LifecycleContext {
  return { pendingVerificationId, unpaidRequests };
}

export function resolveLifecycleStage(
  booking: Pick<
    Booking,
    | "status"
    | "detailStatus"
    | "showVerifyPayment"
    | "amountPaid"
    | "packagePrice"
    | "paymentMeta"
    | "progressStep"
    | "galleryStep"
  >,
  ctx: LifecycleContext,
): BookingLifecycleStage {
  if (booking.status === "cancelled" || booking.detailStatus === "cancelled") {
    return "cancelled";
  }

  if (isSessionCompleted(booking)) {
    if (hasOutstandingBalance(booking)) {
      return "awaiting_balance";
    }

    return booking.galleryStep >= 3 ? "gallery_delivery" : "session_completed";
  }

  const awaitingVerification =
    ctx.pendingVerificationId !== null ||
    booking.showVerifyPayment ||
    booking.detailStatus === "pendingVerification";

  if (awaitingVerification) {
    return "awaiting_verification";
  }

  if (booking.status === "confirmed" || booking.detailStatus === "confirmed") {
    if (booking.progressStep >= 3) {
      return "session_scheduled";
    }
    return "confirmed";
  }

  if (booking.status === "pending") {
    return "awaiting_deposit";
  }

  return "session_scheduled";
}

/** Booking may only be cancelled before any deposit receipt is in play. */
export function canPhotographerCancelBooking(
  booking: Pick<Booking, "status" | "amountPaid" | "showVerifyPayment">,
  ctx: LifecycleContext,
): boolean {
  if (booking.status !== "pending") {
    return false;
  }
  if (booking.amountPaid > 0) {
    return false;
  }
  if (booking.showVerifyPayment || ctx.pendingVerificationId !== null) {
    return false;
  }
  return true;
}

/**
 * Manual confirmation is only for exceptional cases (e.g. complimentary session)
 * where no deposit receipt has been submitted. Standard client bookings confirm
 * automatically when a deposit payment is verified.
 */
export function canPhotographerManuallyConfirm(
  booking: Pick<Booking, "status" | "amountPaid" | "showVerifyPayment">,
  ctx: LifecycleContext,
): boolean {
  return canPhotographerCancelBooking(booking, ctx);
}

export function isBookingProtectedByDeposit(
  booking: Pick<Booking, "amountPaid" | "showVerifyPayment">,
  ctx: LifecycleContext,
): boolean {
  return (
    booking.amountPaid > 0 ||
    booking.showVerifyPayment ||
    ctx.pendingVerificationId !== null
  );
}

export function resolveClientPrimaryAction(
  stage: BookingLifecycleStage,
  bookingId: string,
  ctx: LifecycleContext,
  galleryId?: string | null,
): LifecyclePrimaryAction | null {
  switch (stage) {
    case "awaiting_deposit": {
      const deposit = firstUnpaid(ctx.unpaidRequests, "deposit");
      if (!deposit) {
        return null;
      }
      return {
        type: "link",
        label: "Pay deposit",
        href: `/client/payments/upload?booking=${bookingId}&payment=${deposit.id}`,
        variant: "default",
      };
    }
    case "awaiting_balance": {
      const balance =
        firstUnpaid(ctx.unpaidRequests, "balance") ??
        firstUnpaid(ctx.unpaidRequests, "full");
      if (!balance) {
        return {
          type: "link",
          label: "View payments",
          href: `/client/payments`,
          variant: "default",
        };
      }
      return {
        type: "link",
        label: "Pay final balance",
        href: `/client/payments/upload?booking=${bookingId}&payment=${balance.id}`,
        variant: "default",
      };
    }
    case "session_completed":
    case "gallery_delivery":
      if (galleryId) {
        return {
          type: "link",
          label: "View gallery",
          href: `/client/galleries/${galleryId}`,
          variant: "default",
        };
      }
      return null;
    default:
      return null;
  }
}

export function resolvePhotographerPrimaryAction(
  stage: BookingLifecycleStage,
  bookingId: string,
  ctx: LifecycleContext,
  galleryId?: string | null,
): LifecyclePrimaryAction | null {
  switch (stage) {
    case "awaiting_verification":
      if (!ctx.pendingVerificationId) {
        return {
          type: "link",
          label: "Review payment",
          href: `/photographer/payments?booking=${bookingId}`,
          variant: "default",
        };
      }
      return {
        type: "link",
        label: "Review payment",
        href: `/photographer/payments?verification=${ctx.pendingVerificationId}&booking=${bookingId}`,
        variant: "default",
      };
    case "awaiting_balance":
      return {
        type: "link",
        label: "Review payments",
        href: `/photographer/payments?booking=${bookingId}`,
        variant: "default",
      };
    case "session_scheduled":
    case "confirmed":
      return {
        type: "markComplete",
        label: "Mark session complete",
        variant: "default",
      };
    case "session_completed":
      if (galleryId) {
        return {
          type: "link",
          label: "Manage gallery",
          href: `/photographer/galleries/${galleryId}`,
          variant: "default",
        };
      }
      return {
        type: "link",
        label: "Create gallery",
        href: `/photographer/galleries/new?booking=${bookingId}`,
        variant: "default",
      };
    case "gallery_delivery":
      if (!galleryId) {
        return {
          type: "link",
          label: "Create gallery",
          href: `/photographer/galleries/new?booking=${bookingId}`,
          variant: "default",
        };
      }
      return {
        type: "link",
        label: "View gallery",
        href: `/photographer/galleries/${galleryId}`,
        variant: "default",
      };
    default:
      return null;
  }
}

export function resolveLifecycleStatusMessage(
  stage: BookingLifecycleStage,
  audience: "client" | "photographer",
  galleryId?: string | null,
): string | null {
  if (stage === "awaiting_verification" && audience === "client") {
    return "Your receipt is with the studio for verification. Your booking will be confirmed once the deposit is approved.";
  }
  if (stage === "awaiting_deposit" && audience === "photographer") {
    return "Waiting for the client to pay the deposit and upload a receipt.";
  }
  if (stage === "awaiting_verification" && audience === "photographer") {
    return "Verify the deposit in Payments. Approving the payment will confirm this booking.";
  }
  if (stage === "awaiting_balance" && audience === "client") {
    return "Your session is complete. Pay the remaining balance to unlock gallery delivery.";
  }
  if (stage === "awaiting_balance" && audience === "photographer") {
    return "Final balance is due before you can create or deliver the gallery. Release early from booking settings if needed.";
  }
  if (stage === "session_completed" && audience === "photographer" && !galleryId) {
    return "Session complete. Create a gallery to upload photos and deliver them to your client.";
  }
  if (stage === "session_completed" && audience === "photographer" && galleryId) {
    return "Gallery linked to this booking. Upload photos and publish when ready.";
  }
  if (stage === "gallery_delivery" && audience === "photographer" && galleryId) {
    return "Gallery delivered to your client. This booking has reached its final milestone.";
  }
  return null;
}
