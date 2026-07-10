import type { Booking } from "@prisma/client";

export type UnpaidPaymentRequest = {
  id: string;
  amount: number;
  type: string;
  status: string;
};

type BookingPaymentSnapshot = Pick<
  Booking,
  "amountPaid" | "packagePrice" | "depositPercent"
>;

function isOpenObligation(request: UnpaidPaymentRequest) {
  return request.status === "unpaid" || request.status === "pending";
}

export function sumUnpaidPaymentRequests(requests: UnpaidPaymentRequest[]) {
  return requests
    .filter(isOpenObligation)
    .reduce((total, request) => total + request.amount, 0);
}

export function resolveCalculatedDepositAmount(booking: BookingPaymentSnapshot) {
  const depositPercent = booking.depositPercent ?? 50;
  return Math.round(booking.packagePrice * (depositPercent / 100));
}

/** Deposit amount defined on the booking's payment request (photographer package terms). */
export function resolveAgreedDepositAmount(
  booking: BookingPaymentSnapshot,
  paymentRequests: UnpaidPaymentRequest[],
) {
  const depositRequest = paymentRequests.find((request) => request.type === "deposit");
  if (depositRequest) {
    return depositRequest.amount;
  }

  return resolveCalculatedDepositAmount(booking);
}

/** Matches the deposit line item clients see on the payments page. */
export function resolveDepositDueAmount(
  booking: BookingPaymentSnapshot,
  unpaidRequests: UnpaidPaymentRequest[],
) {
  const open = unpaidRequests.filter(isOpenObligation);
  const unpaidDepositTotal = open
    .filter((request) => request.type === "deposit")
    .reduce((total, request) => total + request.amount, 0);

  if (unpaidDepositTotal > 0) {
    return unpaidDepositTotal;
  }

  const unpaidTotal = sumUnpaidPaymentRequests(open);
  if (unpaidTotal > 0) {
    return unpaidTotal;
  }

  return Math.max(0, resolveCalculatedDepositAmount(booking) - booking.amountPaid);
}

/** Amount still owed right now (open payment requests, else package balance). */
export function resolveOutstandingDue(
  booking: BookingPaymentSnapshot,
  unpaidRequests: UnpaidPaymentRequest[],
) {
  const unpaidTotal = sumUnpaidPaymentRequests(unpaidRequests);
  if (unpaidTotal > 0) {
    return unpaidTotal;
  }

  return Math.max(0, booking.packagePrice - booking.amountPaid);
}
