import type { Booking, BookingPaymentStatus, BookingStatus } from "@prisma/client";
import {
  buildLifecycleContext,
  canPhotographerCancelBooking,
  canPhotographerManuallyConfirm,
  resolveClientPrimaryAction,
  resolveLifecycleStage,
  resolveLifecycleStatusMessage,
  resolvePhotographerPrimaryAction,
  type LifecyclePrimaryAction,
  type BookingLifecycleStage,
} from "../../lib/booking-lifecycle.js";
import {
  canReleaseGallery,
  hasOutstandingPackageBalance,
  readGalleryReleaseOverride,
} from "../../lib/gallery-release.js";
import { formatDisplayDate } from "../../lib/date-format.js";
import {
  resolvePackageCoverImage,
  type BookingWithPackageCover,
} from "../../lib/package-cover.js";
import { resolveBookingClientProfile } from "../../lib/booking-client-profile.js";
import { buildBookingActivityTimeline } from "../../lib/booking-timeline.js";
import { mergeBookingProgress } from "../../lib/booking-progress.js";
import { resolveClientPaymentStatusLabel } from "../../lib/payment-status-label.js";
import {
  resolveOutstandingDue,
  type UnpaidPaymentRequest,
} from "../../lib/payment-obligations.js";

export type ApiBooking = {
  id: string;
  studioId: string;
  clientName: string;
  email: string;
  avatarAssetKey: string | null;
  packageName: string;
  packageDetail: string;
  date: string;
  time: string;
  payment: BookingPaymentStatus;
  status: BookingStatus;
  actions: {
    canView: boolean;
    canConfirm: boolean;
    canCancel: boolean;
    confirmDisabled?: boolean;
  };
};

export type ApiBookingDetail = {
  id: string;
  reference: string;
  detailStatus: string;
  requestedDate: string;
  sessionLabel: string;
  client: {
    name: string;
    initials: string;
    avatarAssetKey: string | null;
    preferredSince: number | null;
    email: string;
    phone: string;
    instagram: string;
  };
  event: {
    date: string;
    timeWindow: string;
    venue: string;
    city: string;
  };
  package: {
    title: string;
    subtitle: string;
    price: number;
    includes: string[];
    coverAssetKey: string;
  };
  payment: {
    statusLabel: string;
    receiptAssetKey: string | null;
    amountPaid: number;
    transactionRef: string;
    paymentDate: string;
    verificationStatus: "verified" | "pending";
    note?: string;
    outstandingDue: number;
  };
  timeline: unknown[];
  showVerifyPayment: boolean;
  pendingVerificationId: string | null;
  progressStep: number;
  galleryStep: number;
  galleryId: string | null;
  clientId: string | null;
  lifecycleStage: BookingLifecycleStage;
  primaryAction: LifecyclePrimaryAction | null;
  statusMessage: string | null;
  galleryReleaseBlocked: boolean;
  galleryReleaseOverride: boolean;
};

export type ApiPaymentRequest = {
  id: string;
  bookingId: string;
  studioId: string;
  studioSlug: string;
  studioName: string;
  bookingTitle: string;
  type: string;
  amount: number;
  dueDate: string;
  invoiceRef: string;
  bookingReference: string;
  status: string;
  /** Package total for the parent booking — lets clients opt to pay in full. */
  packagePrice: number;
  /** Amount already settled on the parent booking. */
  amountPaid: number;
  /** Remaining amount to settle the booking in full (packagePrice - amountPaid). */
  fullAmount: number;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildActions(
  booking: Booking,
  pendingVerificationId: string | null = null,
): ApiBooking["actions"] {
  const lifecycleContext = buildLifecycleContext(pendingVerificationId);

  return {
    canView: true,
    canConfirm: canPhotographerManuallyConfirm(booking, lifecycleContext),
    canCancel: canPhotographerCancelBooking(booking, lifecycleContext),
    confirmDisabled: !canPhotographerManuallyConfirm(booking, lifecycleContext),
  };
}

export function toApiBooking(
  booking: Booking,
  studioSlug: string,
  avatarAssetKey?: string | null,
  pendingVerificationId: string | null = null,
): ApiBooking {
  return {
    id: booking.id,
    studioId: studioSlug,
    clientName: booking.clientName,
    email: booking.clientEmail,
    avatarAssetKey: avatarAssetKey ?? booking.clientAvatarAssetKey,
    packageName: booking.packageName,
    packageDetail: booking.packageDetail,
    date: booking.sessionDateLabel,
    time: booking.sessionTime,
    payment: booking.paymentStatus,
    status: booking.status,
    actions: buildActions(booking, pendingVerificationId),
  };
}

export type BookingDetailAudience = "client" | "photographer";

type BookingDetailProfileContext = {
  crmClient?: {
    phone: string;
    memberSince: Date;
    name: string;
    email: string;
  } | null;
  linkedUser?: {
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    createdAt: Date;
  } | null;
};

export function toApiBookingDetail(
  booking: BookingWithPackageCover & {
    gallery?: {
      workflowStatus: string;
      photoCount: number;
    } | null;
  },
  avatarAssetKey?: string | null,
  unpaidPaymentRequests: UnpaidPaymentRequest[] = [],
  pendingVerificationId: string | null = null,
  audience: BookingDetailAudience = "photographer",
  profileContext: BookingDetailProfileContext = {},
): ApiBookingDetail {
  const paymentMeta = (booking.paymentMeta ?? {}) as Record<string, unknown>;
  const progress = mergeBookingProgress(
    {
      progressStep: booking.progressStep,
      galleryStep: booking.galleryStep,
    },
    booking.gallery ?? null,
  );
  const bookingForLifecycle = {
    ...booking,
    progressStep: progress.progressStep,
    galleryStep: progress.galleryStep,
  };
  const profile = resolveBookingClientProfile({
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    clientMeta: booking.clientMeta,
    crmClient: profileContext.crmClient ?? null,
    linkedUser: profileContext.linkedUser ?? null,
  });
  const packageIncludes = Array.isArray(booking.packageIncludes)
    ? (booking.packageIncludes as string[])
    : [];

  const lifecycleContext = buildLifecycleContext(
    pendingVerificationId,
    unpaidPaymentRequests.map((request) => ({
      id: request.id,
      type: request.type,
      status: request.status,
    })),
  );
  const lifecycleStage = resolveLifecycleStage(bookingForLifecycle, lifecycleContext);
  const primaryAction =
    audience === "client"
      ? resolveClientPrimaryAction(
          lifecycleStage,
          booking.id,
          lifecycleContext,
          booking.galleryId,
        )
      : resolvePhotographerPrimaryAction(
          lifecycleStage,
          booking.id,
          lifecycleContext,
          booking.galleryId,
        );
  const statusMessage = resolveLifecycleStatusMessage(
    lifecycleStage,
    audience,
    booking.galleryId,
  );

  return {
    id: booking.id,
    reference: booking.reference,
    detailStatus: booking.detailStatus,
    requestedDate: formatDisplayDate(booking.requestedAt),
    sessionLabel: booking.packageName,
    client: {
      name: profile.name,
      initials: getInitials(profile.name),
      avatarAssetKey: avatarAssetKey ?? booking.clientAvatarAssetKey,
      preferredSince: profile.preferredSince,
      email: profile.email,
      phone: profile.phone,
      instagram: profile.instagram,
    },
    event: {
      date: booking.sessionDateLabel,
      timeWindow: booking.timeWindow ?? `${booking.sessionTime} (Session)`,
      venue: booking.venue ?? "Location to be confirmed",
      city: booking.city ?? "Kigali, Rwanda",
    },
    package: {
      title: booking.packageName,
      subtitle: booking.packageDetail,
      price: booking.packagePrice,
      includes: packageIncludes,
      coverAssetKey: resolvePackageCoverImage(booking),
    },
    payment: {
      statusLabel: resolveClientPaymentStatusLabel(booking, unpaidPaymentRequests),
      receiptAssetKey:
        typeof paymentMeta.receiptAssetKey === "string" ? paymentMeta.receiptAssetKey : null,
      amountPaid: booking.amountPaid,
      outstandingDue: resolveOutstandingDue(booking, unpaidPaymentRequests),
      transactionRef:
        typeof paymentMeta.transactionRef === "string" ? paymentMeta.transactionRef : "—",
      paymentDate:
        typeof paymentMeta.paymentDate === "string"
          ? paymentMeta.paymentDate
          : booking.sessionDateLabel,
      verificationStatus:
        paymentMeta.verificationStatus === "verified" ? "verified" : "pending",
      note: typeof paymentMeta.note === "string" ? paymentMeta.note : undefined,
    },
    timeline: buildBookingActivityTimeline(
      {
        status: booking.status,
        detailStatus: booking.detailStatus,
        showVerifyPayment: booking.showVerifyPayment,
        amountPaid: booking.amountPaid,
        packagePrice: booking.packagePrice,
        paymentMeta: booking.paymentMeta,
        sessionDateLabel: booking.sessionDateLabel,
        sessionTime: booking.sessionTime,
        requestedAt: booking.requestedAt,
        progressStep: progress.progressStep,
        galleryStep: progress.galleryStep,
        galleryId: booking.galleryId,
      },
      lifecycleContext,
    ),
    showVerifyPayment: booking.showVerifyPayment,
    pendingVerificationId,
    progressStep: progress.progressStep,
    galleryStep: progress.galleryStep,
    galleryId: booking.galleryId,
    clientId: booking.clientId,
    lifecycleStage,
    primaryAction,
    statusMessage,
    galleryReleaseBlocked:
      hasOutstandingPackageBalance(booking) && !canReleaseGallery(booking),
    galleryReleaseOverride: readGalleryReleaseOverride(booking.paymentMeta),
  };
}

export function toApiPaymentRequest(
  request: {
    id: string;
    bookingId: string;
    studioId: string;
    type: string;
    amount: number;
    status: string;
    dueDate: Date | null;
    invoiceRef: string | null;
    bookingReference: string | null;
    bookingTitle: string | null;
  },
  studioSlug: string,
  studioName: string,
  booking?: { packagePrice: number; amountPaid: number },
): ApiPaymentRequest {
  const packagePrice = booking?.packagePrice ?? request.amount;
  const amountPaid = booking?.amountPaid ?? 0;
  const fullAmount = Math.max(0, packagePrice - amountPaid);

  return {
    id: request.id,
    bookingId: request.bookingId,
    studioId: studioSlug,
    studioSlug,
    studioName,
    bookingTitle: request.bookingTitle ?? "Booking",
    type: request.type,
    amount: request.amount,
    dueDate: request.dueDate ? formatDisplayDate(request.dueDate) : "—",
    invoiceRef: request.invoiceRef ?? "—",
    bookingReference: request.bookingReference ?? "—",
    status: request.status,
    packagePrice,
    amountPaid,
    fullAmount,
  };
}
