import type { Booking, BookingDetail, PaymentRequest } from "@/types/domains/booking";
import type {
  ClientPaymentRecord,
  PaymentVerification,
  StudioPaymentProfile,
} from "@/types/domains/payment";
import type {
  GalleryDetail,
  GalleryPhoto,
  PhotographerGallery,
} from "@/types/domains/gallery";
import type { ClientDashboardSummary } from "@/types/domains/dashboard";
import type { ServicePackage } from "@/types/domains/service";
import type { ClientNotification } from "@/types/domains/notification";
import type { ClientSettings } from "@/types/domains/settings";

export type CreateClientBookingInput = {
  servicePackageId: string;
  date: string;
  time: string;
  locationNotes: string;
};

export type UploadReceiptInput = {
  bookingId: string;
  paymentRequestId?: string;
  amount: number;
  receiptImage: string;
  paymentOption?: "deposit" | "full";
};

export type ClientOutstandingSummary = {
  totalBalance: number;
  unpaidCount: number;
  obligations: PaymentRequest[];
};

export type ClientApi = {
  bookings: {
    list: () => Promise<Booking[]>;
    getById: (id: string) => Promise<Booking | undefined>;
    getDetail: (id: string) => Promise<BookingDetail | undefined>;
    getUpcoming: () => Promise<Booking | undefined>;
    getGalleryIdForBooking: (bookingId: string) => Promise<string | undefined>;
    create: (input: CreateClientBookingInput) => Promise<Booking>;
  };
  payments: {
    list: () => Promise<ClientPaymentRecord[]>;
    listRequests: () => Promise<PaymentRequest[]>;
    getRequestById: (id: string) => Promise<PaymentRequest | undefined>;
    getOutstandingSummary: () => Promise<ClientOutstandingSummary>;
    uploadReceipt: (input: UploadReceiptInput) => Promise<PaymentVerification>;
    getStudioPaymentProfile: (slug: string) => Promise<StudioPaymentProfile>;
  };
  galleries: {
    list: () => Promise<PhotographerGallery[]>;
    getById: (id: string) => Promise<PhotographerGallery | undefined>;
    getDetail: (id: string, accessPin?: string) => Promise<GalleryDetail | undefined>;
    verifyPin: (galleryId: string, pin: string) => Promise<boolean>;
    getPhotoDownloadUrl: (
      galleryId: string,
      photoId: string,
      accessPin?: string,
    ) => Promise<GalleryPhoto | undefined>;
    prepareDownload: (galleryId: string, accessPin?: string) => Promise<GalleryPhoto[]>;
  };
  notifications: {
    list: () => Promise<ClientNotification[]>;
    markAllRead: () => Promise<ClientNotification[]>;
    markRead: (id: string) => Promise<ClientNotification[]>;
  };
  dashboard: {
    getSummary: () => Promise<ClientDashboardSummary>;
  };
  services: {
    listPublic: () => Promise<ServicePackage[]>;
    listPublicByStudio: (studioSlug: string) => Promise<ServicePackage[]>;
  };
  studios: {
    list: () => Promise<Array<{ slug: string; name: string; avatarAssetKey: string | null }>>;
  };
  settings: {
    get: () => Promise<ClientSettings>;
    update: (
      payload: Omit<ClientSettings, "email" | "notifications">,
    ) => Promise<ClientSettings>;
    updateNotifications: (
      notifications: ClientSettings["notifications"],
    ) => Promise<ClientSettings>;
    updateSecurity: (
      payload: import("@/types/domains/settings").ClientSecuritySettings,
    ) => Promise<void>;
    deactivate: () => Promise<void>;
  };
  availability: typeof import("@/services/availability").clientAvailabilityHttp;
};
