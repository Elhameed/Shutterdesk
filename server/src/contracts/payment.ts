import type { VerificationStatus } from "./enums.js";

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

/** How a studio wants to be paid. Surfaced to clients at checkout. */
export type ApiStudioPaymentProfile = {
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
