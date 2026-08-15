import { assetUrl } from "@/lib/asset-url";
import { landingAssets } from "@/constants/assets";
import { resolveMediaUrl } from "@/lib/media-url";
import type {
  ApiBooking,
  ApiBookingDetail,
  Booking,
  BookingDetail,
  PaymentRequest,
} from "@/types/domains/booking";

const defaultAvatar = assetUrl("app/user-avatar");
const defaultReceipt = assetUrl("photographer/booking-receipt-preview");
const defaultPackageCover =
  landingAssets.gallery.portrait[1]?.src ??
  landingAssets.gallery.portrait[0]?.src ??
  defaultAvatar;

function resolveAvatar(assetKey: string | null | undefined) {
  return resolveMediaUrl(assetKey, defaultAvatar);
}

export function mapApiBooking(apiBooking: ApiBooking): Booking {
  return {
    id: apiBooking.id,
    studioId: apiBooking.studioId,
    clientName: apiBooking.clientName,
    email: apiBooking.email,
    avatar: resolveAvatar(apiBooking.avatarAssetKey),
    packageName: apiBooking.packageName,
    packageDetail: apiBooking.packageDetail,
    date: apiBooking.date,
    time: apiBooking.time,
    payment: apiBooking.payment,
    status: apiBooking.status,
    actions: apiBooking.actions,
  };
}

export function mapApiBookingDetail(detail: ApiBookingDetail): BookingDetail {
  return {
    ...detail,
    client: {
      ...detail.client,
      avatar: resolveAvatar(detail.client.avatarAssetKey),
    },
    package: {
      ...detail.package,
      coverImage: resolveMediaUrl(detail.package.coverAssetKey, defaultPackageCover),
    },
    payment: {
      ...detail.payment,
      receiptImage: detail.payment.receiptAssetKey
        ? resolveMediaUrl(detail.payment.receiptAssetKey, defaultReceipt)
        : "",
    },
  };
}

export function mapApiPaymentRequest(
  request: PaymentRequest & { studioSlug?: string; studioName?: string },
): PaymentRequest {
  return {
    ...request,
    studioId: request.studioSlug ?? request.studioId,
    studioName: request.studioName,
  };
}
