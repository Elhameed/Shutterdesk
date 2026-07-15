import { ROUTES } from "@/constants/routes";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import type {
  BookingDetail,
  BookingPrimaryAction,
} from "@/types/domains/booking";

export type BookingDetailHeaderAction =
  | {
      kind: "reject";
      label: string;
      variant: "outline";
    }
  | {
      kind: "markComplete";
      label: string;
      variant: "default" | "outline";
    }
  | {
      kind: "link";
      label: string;
      href: string;
      variant: "default" | "outline";
    };

function mapPrimaryAction(
  action: BookingPrimaryAction,
): BookingDetailHeaderAction {
  if (action.type === "markComplete") {
    return {
      kind: "markComplete",
      label: action.label,
      variant: action.variant,
    };
  }

  return {
    kind: "link",
    label: action.label,
    href: action.href,
    variant: action.variant,
  };
}

export function resolveBookingDetailHeaderActions(
  booking: BookingDetail,
): BookingDetailHeaderAction[] {
  const copy = BOOKING_DETAIL_COPY;

  if (
    booking.detailStatus === "cancelled" ||
    booking.detailStatus === "completed" ||
    booking.lifecycleStage === "cancelled"
  ) {
    return [];
  }

  const actions: BookingDetailHeaderAction[] = [];

  if (booking.lifecycleStage === "awaiting_deposit") {
    actions.push({
      kind: "reject",
      label: copy.declineBooking,
      variant: "outline",
    });
  }

  if (booking.primaryAction) {
    actions.push(mapPrimaryAction(booking.primaryAction));
    return actions;
  }

  if (booking.lifecycleStage === "awaiting_verification") {
    return [
      {
        kind: "link",
        label: copy.openPaymentsQueue,
        href: ROUTES.photographer.paymentVerification({
          verificationId: booking.pendingVerificationId ?? undefined,
          bookingId: booking.id,
        }),
        variant: "default",
      },
    ];
  }

  return actions;
}
