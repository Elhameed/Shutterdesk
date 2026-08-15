import type { Booking } from "@prisma/client";
import { AppError } from "../middleware/error-handler.js";
import { formatRwf } from "./currency-format.js";

type BookingPaymentSnapshot = Pick<
  Booking,
  "packagePrice" | "amountPaid" | "paymentMeta"
>;

export function hasOutstandingPackageBalance(booking: BookingPaymentSnapshot) {
  return booking.amountPaid < booking.packagePrice;
}

export function readGalleryReleaseOverride(paymentMeta: unknown) {
  if (!paymentMeta || typeof paymentMeta !== "object") {
    return false;
  }

  return (paymentMeta as { galleryReleaseOverride?: boolean }).galleryReleaseOverride ===
    true;
}

export function canReleaseGallery(booking: BookingPaymentSnapshot) {
  if (readGalleryReleaseOverride(booking.paymentMeta)) {
    return true;
  }

  return !hasOutstandingPackageBalance(booking);
}

export function assertGalleryReleaseAllowed(
  booking: BookingPaymentSnapshot | null | undefined,
) {
  if (!booking || canReleaseGallery(booking)) {
    return;
  }

  const remaining = booking.packagePrice - booking.amountPaid;

  throw new AppError(
    `Collect the remaining balance (${formatRwf(remaining)}) before releasing the gallery to your client.`,
    409,
  );
}
