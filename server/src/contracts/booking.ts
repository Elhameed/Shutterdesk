import type { BookingPaymentStatus, BookingStatus } from "./enums.js";

/**
 * The stage a booking is at, derived from its fields rather than stored.
 * `domain/booking-lifecycle.ts` is the single source of truth for the
 * transitions; this is the wire spelling of the result.
 */
export type BookingLifecycleStage =
  | "awaiting_deposit"
  | "awaiting_verification"
  | "confirmed"
  | "awaiting_balance"
  | "session_scheduled"
  | "session_completed"
  | "gallery_delivery"
  | "cancelled";

/** The one action the API suggests for this booking, for the calling audience. */
export type LifecyclePrimaryAction =
  | {
      type: "link";
      label: string;
      href: string;
      variant: "default" | "outline";
    }
  | {
      type: "markComplete";
      label: string;
      variant: "default" | "outline";
    };

/**
 * The finer-grained status shown on a booking detail screen, alongside the
 * coarse `BookingStatus`.
 *
 * `Booking.detailStatus` is a plain `String` column, so the server's type for
 * it was `string` while the client had always assumed this five-value union.
 * These are the only values any code path writes, so the union is the honest
 * contract; `toBookingDetailStatus` narrows at the boundary.
 */
export type BookingDetailStatus =
  | "pending"
  | "pendingVerification"
  | "confirmed"
  | "completed"
  | "cancelled";

/** Which controls the photographer should see on a booking row. */
export type BookingActions = {
  canView: boolean;
  canConfirm: boolean;
  canCancel: boolean;
  confirmDisabled?: boolean;
};

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
  actions: BookingActions;
};

/**
 * One step in a booking's activity timeline. Was `unknown[]` on the wire, so
 * the client had no idea what it was rendering — this matches
 * `BookingTimelineStep` in `domain/booking-timeline.ts`, which produces it.
 */
export type ApiBookingTimelineEntry = {
  id: string;
  title: string;
  timestamp: string;
  state: "completed" | "current" | "upcoming";
  note?: string;
  attachment?: string;
};

export type ApiBookingDetail = {
  id: string;
  reference: string;
  detailStatus: BookingDetailStatus;
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
  timeline: ApiBookingTimelineEntry[];
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
