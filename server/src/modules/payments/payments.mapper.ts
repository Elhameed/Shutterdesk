import type { PaymentRecord, PaymentVerification, Studio } from "@prisma/client";
import { formatDisplayDate } from "../../lib/date-format.js";

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
  status: "pending" | "approved" | "rejected";
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
  status: "pending" | "approved" | "rejected";
  receiptAssetKey: string;
};

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

export function toApiPaymentVerification(
  verification: PaymentVerification,
  studioSlug: string,
  avatarAssetKey?: string | null,
): ApiPaymentVerification {
  return {
    id: verification.id,
    studioId: studioSlug,
    bookingId: verification.bookingId,
    paymentRequestId: verification.paymentRequestId,
    transactionId: verification.transactionId,
    clientName: verification.clientName,
    avatarAssetKey: avatarAssetKey ?? verification.clientAvatarAssetKey,
    bookingTitle: verification.bookingTitle,
    packageName: verification.packageName,
    bookingDate: verification.bookingDate,
    amount: verification.amount,
    receiptAssetKey: verification.receiptAssetKey,
    status: verification.status,
    highPriority: verification.highPriority,
  };
}

export function toApiClientPaymentRecord(
  record: PaymentRecord,
  studioSlug: string,
): ApiClientPaymentRecord {
  return {
    id: record.id,
    bookingId: record.bookingId,
    studioId: studioSlug,
    studioName: record.studioName,
    paymentRequestId: record.paymentRequestId,
    bookingTitle: record.bookingTitle,
    amount: record.amount,
    date: formatDisplayDate(record.paidAt),
    status: record.status,
    receiptAssetKey: record.receiptAssetKey,
  };
}

export function verificationToClientRecord(
  verification: PaymentVerification,
  studio: Pick<Studio, "name" | "slug">,
): ApiClientPaymentRecord {
  return {
    id: verification.id,
    bookingId: verification.bookingId,
    studioId: studio.slug,
    studioName: studio.name,
    paymentRequestId: verification.paymentRequestId,
    bookingTitle: verification.bookingTitle,
    amount: verification.amount,
    date: formatDisplayDate(verification.submittedAt),
    status: verification.status,
    receiptAssetKey: verification.receiptAssetKey,
  };
}

export function parseStudioPaymentProfile(
  profile: unknown,
): ApiStudioPaymentProfile {
  const data = (profile ?? {}) as Record<string, unknown>;
  return {
    provider:
      typeof data.provider === "string" ? data.provider : "MTN Mobile Money (MoMo)",
    mobileMoneyEnabled: data.mobileMoneyEnabled === true,
    merchantCode: typeof data.merchantCode === "string" ? data.merchantCode : "",
    momoAccountName:
      typeof data.momoAccountName === "string" ? data.momoAccountName : "",
    momoNumber: typeof data.momoNumber === "string" ? data.momoNumber : "",
    bankTransferEnabled: data.bankTransferEnabled === true,
    accountName: typeof data.accountName === "string" ? data.accountName : "",
    accountNumber:
      typeof data.accountNumber === "string" ? data.accountNumber : "",
    referenceHint:
      typeof data.referenceHint === "string"
        ? data.referenceHint
        : "Please include your Booking ID in the reference.",
  };
}
