import type { Booking } from "@prisma/client";
import { formatRwf } from "./currency-format.js";
import {
  resolveAgreedDepositAmount,
  resolveDepositDueAmount,
  type UnpaidPaymentRequest,
} from "./payment-obligations.js";

type BookingPaymentSnapshot = Pick<
  Booking,
  | "amountPaid"
  | "packagePrice"
  | "paymentStatus"
  | "depositPercent"
  | "showVerifyPayment"
> & {
  paymentMeta?: unknown;
};

export function resolveClientPaymentStatusLabel(
  booking: BookingPaymentSnapshot,
  paymentRequests: UnpaidPaymentRequest[] = [],
): string {
  const paymentMeta = (booking.paymentMeta ?? {}) as Record<string, unknown>;
  const verificationStatus = paymentMeta.verificationStatus;
  const storedStatusLabel =
    typeof paymentMeta.statusLabel === "string"
      ? paymentMeta.statusLabel.trim()
      : "";

  if (
    storedStatusLabel &&
    (paymentMeta.resubmitRequestedAt ||
      storedStatusLabel.toLowerCase().includes("rejected") ||
      storedStatusLabel.toLowerCase().includes("receipt requested") ||
      storedStatusLabel.toLowerCase().includes("final balance due"))
  ) {
    return storedStatusLabel;
  }

  const amountPaid = booking.amountPaid;
  const packagePrice = booking.packagePrice;
  const depositPercent = booking.depositPercent ?? 50;
  const depositDue = resolveDepositDueAmount(booking, paymentRequests);
  const agreedDeposit = resolveAgreedDepositAmount(booking, paymentRequests);

  if (
    booking.showVerifyPayment &&
    verificationStatus !== "verified" &&
    amountPaid < packagePrice
  ) {
    return paymentMeta.paymentOption === "full"
      ? "Payment Pending Verification"
      : "Deposit Pending Verification";
  }

  if (booking.paymentStatus === "paid" || amountPaid >= packagePrice) {
    return "Paid in Full";
  }

  if (amountPaid === 0) {
    return `Deposit Due (${formatRwf(depositDue)})`;
  }

  if (amountPaid >= agreedDeposit && amountPaid < packagePrice) {
    return `Deposit Received (${depositPercent}%)`;
  }

  return `Deposit Due (${formatRwf(depositDue)} remaining)`;
}
