import { assetUrl } from "@/lib/asset-url";
import { resolveMediaUrl } from "@/lib/media-url";
import type {
  ApiClientPaymentRecord,
  ApiPaymentVerification,
  ClientPaymentRecord,
  PaymentVerification,
} from "@/types/domains/payment";

const defaultAvatar = assetUrl("app/user-avatar");
const defaultReceipt = assetUrl("photographer/booking-receipt-preview");

function resolveReceiptImage(receiptAssetKey: string) {
  if (receiptAssetKey.startsWith("data:") || receiptAssetKey.startsWith("http")) {
    return receiptAssetKey;
  }
  return assetUrl(receiptAssetKey) || defaultReceipt;
}

export function mapApiPaymentVerification(
  api: ApiPaymentVerification,
): PaymentVerification {
  return {
    id: api.id,
    studioId: api.studioId,
    bookingId: api.bookingId,
    paymentRequestId: api.paymentRequestId ?? undefined,
    transactionId: api.transactionId,
    clientName: api.clientName,
    avatar: resolveMediaUrl(api.avatarAssetKey, defaultAvatar),
    bookingTitle: api.bookingTitle,
    packageName: api.packageName,
    bookingDate: api.bookingDate,
    amount: api.amount,
    receiptImage: resolveReceiptImage(api.receiptAssetKey),
    status: api.status,
    highPriority: api.highPriority,
  };
}

export function mapApiClientPaymentRecord(
  api: ApiClientPaymentRecord,
): ClientPaymentRecord {
  return {
    id: api.id,
    bookingId: api.bookingId,
    studioId: api.studioId,
    studioName: api.studioName,
    paymentRequestId: api.paymentRequestId ?? undefined,
    bookingTitle: api.bookingTitle,
    amount: api.amount,
    date: api.date,
    status: api.status,
    receiptImage: resolveReceiptImage(api.receiptAssetKey),
  };
}
