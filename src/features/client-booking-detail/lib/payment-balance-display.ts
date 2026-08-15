import type { BookingDetail } from "@/types/domains/booking";

type PaymentSnapshot = Pick<
  BookingDetail["payment"],
  "amountPaid" | "outstandingDue"
>;

type BalanceLabels = {
  depositDue: string;
  outstandingBalance: string;
  paidInFull: string;
  noOutstandingBalance: string;
};

export function resolveClientPaymentBalanceDisplay(
  payment: PaymentSnapshot,
  labels: BalanceLabels,
) {
  if (payment.outstandingDue <= 0) {
    return {
      label: labels.noOutstandingBalance,
      amount: 0,
      isPaidInFull: true,
      paidInFullLabel: labels.paidInFull,
    };
  }

  if (payment.amountPaid === 0) {
    return {
      label: labels.depositDue,
      amount: payment.outstandingDue,
      isPaidInFull: false,
      paidInFullLabel: labels.paidInFull,
    };
  }

  return {
    label: labels.outstandingBalance,
    amount: payment.outstandingDue,
    isPaidInFull: false,
    paidInFullLabel: labels.paidInFull,
  };
}
