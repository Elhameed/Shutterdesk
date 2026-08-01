export type VerificationStatus = "pending" | "approved" | "rejected";

export type PaymentVerification = {
  id: string;
  studioId: string;
  bookingId: string;
  paymentRequestId?: string | null;
  transactionId: string;
  clientName: string;
  avatar: string;
  bookingTitle: string;
  packageName: string;
  bookingDate: string;
  amount: number;
  receiptImage: string;
  status: VerificationStatus;
  highPriority?: boolean;
};

export type ClientPaymentRecord = {
  id: string;
  bookingId: string;
  studioId: string;
  studioName: string;
  paymentRequestId?: string | null;
  bookingTitle: string;
  amount: number;
  date: string;
  status: VerificationStatus;
  receiptImage: string;
};

export type StudioPaymentProfile = {
  provider: string;
  mobileMoneyEnabled: boolean;
  merchantCode: string;
  momoAccountName: string;
  momoNumber: string;
  bankTransferEnabled: boolean;
  accountName: string;
  accountNumber: string;
  referenceHint: string;
};

export type ApiPaymentVerification = {
  id: string;
  studioId: string;
  bookingId: string;
  paymentRequestId: string | null;
  transactionId: string;
  clientName: string;
  avatarAssetKey: string | null;
  bookingTitle: string;
  packageName: string;
  bookingDate: string;
  amount: number;
  receiptAssetKey: string;
  status: VerificationStatus;
  highPriority: boolean;
};

export type ApiClientPaymentRecord = {
  id: string;
  bookingId: string;
  studioId: string;
  studioName: string;
  paymentRequestId: string | null;
  bookingTitle: string;
  amount: number;
  date: string;
  status: VerificationStatus;
  receiptAssetKey: string;
};

export const PAYMENT_VERIFICATION_PAGE_SIZE = 4;

export function searchPaymentVerifications(
  verifications: PaymentVerification[],
  query: string,
): PaymentVerification[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return verifications;

  return verifications.filter(
    (item) =>
      item.clientName.toLowerCase().includes(normalized) ||
      item.transactionId.toLowerCase().includes(normalized) ||
      item.bookingTitle.toLowerCase().includes(normalized) ||
      item.packageName.toLowerCase().includes(normalized) ||
      item.bookingDate.toLowerCase().includes(normalized) ||
      item.amount.toString().includes(normalized) ||
      item.status.includes(normalized),
  );
}

export function computePaymentStats(verifications: PaymentVerification[]) {
  const today = new Date().toDateString();
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const pending = verifications.filter((item) => item.status === "pending");
  const approvedToday = verifications
    .filter((item) => item.status === "approved")
    .filter((item) => new Date(item.bookingDate).toDateString() === today)
    .reduce((sum, item) => sum + item.amount, 0);
  const rejectedThisWeek = verifications.filter(
    (item) =>
      item.status === "rejected" &&
      new Date(item.bookingDate).getTime() >= weekAgo,
  ).length;

  return {
    pendingCount: pending.length,
    highPriorityCount: pending.filter((item) => item.highPriority).length,
    approvedToday,
    rejectedThisWeek,
  };
}
