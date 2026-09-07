import type {
  ApiBooking,
  ApiBookingDetail,
  ApiPaymentRequest,
  BookingActions,
  BookingDetailStatus,
  BookingLifecycleStage,
  BookingPaymentStatus,
  BookingPrimaryAction,
  BookingStatus,
} from "@contracts/index.js";

// The wire types come from the shared contract; re-exported here so the
// existing `@/types/domains/booking` imports across the app keep working.
export type {
  ApiBooking,
  ApiBookingDetail,
  ApiPaymentRequest,
  BookingActions,
  BookingDetailStatus,
  BookingLifecycleStage,
  BookingPaymentStatus,
  BookingPrimaryAction,
  BookingStatus,
};

export type Booking = {
  id: string;
  studioId: string;
  clientName: string;
  email: string;
  avatar: string;
  packageName: string;
  packageDetail: string;
  date: string;
  time: string;
  payment: BookingPaymentStatus;
  status: BookingStatus;
  actions: BookingActions;
};

export type TimelineStep = {
  id: string;
  title: string;
  timestamp: string;
  state: "completed" | "current" | "upcoming";
  note?: string;
  attachment?: string;
};

export type BookingDetail = {
  id: string;
  reference: string;
  detailStatus: BookingDetailStatus;
  requestedDate: string;
  sessionLabel: string;
  client: {
    name: string;
    initials: string;
    avatar?: string;
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
    coverImage: string;
  };
  payment: {
    statusLabel: string;
    receiptImage: string;
    amountPaid: number;
    outstandingDue: number;
    transactionRef: string;
    paymentDate: string;
    verificationStatus: "verified" | "pending";
    note?: string;
  };
  timeline: TimelineStep[];
  showVerifyPayment: boolean;
  pendingVerificationId: string | null;
  progressStep: number;
  galleryStep: number;
  galleryId: string | null;
  clientId: string | null;
  lifecycleStage: BookingLifecycleStage;
  primaryAction: BookingPrimaryAction | null;
  statusMessage: string | null;
  galleryReleaseBlocked: boolean;
  galleryReleaseOverride: boolean;
};

export type PaymentRequestStatus = "unpaid" | "pending" | "approved" | "rejected";

export type PaymentRequest = {
  id: string;
  bookingId: string;
  studioId: string;
  studioName?: string;
  bookingTitle: string;
  type: "deposit" | "balance" | "full";
  amount: number;
  dueDate: string;
  invoiceRef: string;
  bookingReference: string;
  status: PaymentRequestStatus;
  /** Package total for the parent booking. */
  packagePrice: number;
  /** Amount already settled on the parent booking. */
  amountPaid: number;
  /** Remaining amount to settle the booking in full. */
  fullAmount: number;
};

export const BOOKING_PROGRESS_STEP_COUNT = 7;
export const GALLERY_STATUS_STEP_COUNT = 4;
