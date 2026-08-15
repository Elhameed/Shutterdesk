import type { Booking, BookingDetail } from "@/types/domains/booking";
import type {
  Client,
  ClientProfileDetail,
} from "@/types/domains/photographer-client";
import type { PaymentVerification } from "@/types/domains/payment";
import type { PhotographerAnalyticsSummary } from "@/types/domains/analytics";
import type { CalendarMonthData } from "@/types/domains/calendar";
import type { PhotographerDashboardSummary, PaginatedPhotographerActivities } from "@/types/domains/dashboard";
import type {
  CreateGalleryInput,
  GalleryDetail,
  PhotographerGallery,
} from "@/types/domains/gallery";
import type {
  CreateServiceInput,
  ServicePackage,
} from "@/types/domains/service";
import type { StudioNotification } from "@/types/domains/notification";

export type CreateBookingInput = {
  clientId?: string;
  clientName: string;
  email: string;
  avatarAssetKey?: string;
  servicePackageId?: string;
  packageName: string;
  packageDetail: string;
  date: string;
  time: string;
  packagePrice?: number;
  venue?: string;
  locationNotes?: string;
};

export type AddClientInput = {
  name: string;
  email: string;
  phone: string;
  category: Client["category"];
  location?: string;
  notes?: string;
};

export type PhotographerApi = {
  bookings: {
    list: () => Promise<Booking[]>;
    getById: (id: string) => Promise<Booking | undefined>;
    getDetail: (id: string) => Promise<BookingDetail | undefined>;
    create: (input: CreateBookingInput) => Promise<Booking>;
    updateStatus: (
      id: string,
      status: Booking["status"],
    ) => Promise<Booking>;
    reschedule: (
      id: string,
      input: { date: string; time: string },
    ) => Promise<Booking>;
    setGalleryReleaseOverride: (
      id: string,
      enabled: boolean,
    ) => Promise<BookingDetail>;
  };
  clients: {
    list: () => Promise<Client[]>;
    add: (input: AddClientInput) => Promise<Client>;
    getById: (id: string) => Promise<Client | null>;
    getProfile: (id: string) => Promise<ClientProfileDetail | null>;
    updateNotes: (id: string, notes: string) => Promise<string | null>;
  };
  payments: {
    list: () => Promise<PaymentVerification[]>;
    updateStatus: (
      id: string,
      status: PaymentVerification["status"],
    ) => Promise<PaymentVerification | undefined>;
    requestResubmission: (id: string) => Promise<PaymentVerification | undefined>;
  };
  galleries: {
    list: () => Promise<PhotographerGallery[]>;
    getById: (id: string) => Promise<PhotographerGallery | undefined>;
    getDetail: (id: string) => Promise<GalleryDetail | undefined>;
    create: (input: CreateGalleryInput) => Promise<PhotographerGallery>;
    update: (
      id: string,
      input: Partial<CreateGalleryInput>,
    ) => Promise<PhotographerGallery>;
    uploadPhotos: (
      id: string,
      photos: Array<{ assetKey: string; thumbnailAssetKey?: string; alt?: string }>,
    ) => Promise<{ gallery: PhotographerGallery; photos: GalleryDetail["photos"] }>;
    deliver: (id: string) => Promise<PhotographerGallery>;
    notifyClient: (id: string) => Promise<GalleryDetail>;
    archive: (id: string) => Promise<GalleryDetail>;
    exportReport: (id: string) => Promise<Record<string, unknown>>;
    deletePhoto: (galleryId: string, photoId: string) => Promise<GalleryDetail>;
    updatePhoto: (
      galleryId: string,
      photoId: string,
      input: { alt?: string; assetKey?: string },
    ) => Promise<GalleryDetail>;
    reorderPhotos: (galleryId: string, photoIds: string[]) => Promise<GalleryDetail>;
    updateDelivery: (
      galleryId: string,
      input: {
        allowDownloads?: boolean;
        highResDownloads?: boolean;
        watermarkEnabled?: boolean;
        clientNotified?: boolean;
        deliveryNotes?: string;
        accessPin?: string;
        expiresAt?: string;
      },
    ) => Promise<GalleryDetail>;
  };
  services: {
    list: () => Promise<ServicePackage[]>;
    getById: (id: string) => Promise<ServicePackage | undefined>;
    create: (input: CreateServiceInput) => Promise<ServicePackage>;
    update: (
      id: string,
      input: Partial<CreateServiceInput>,
    ) => Promise<ServicePackage>;
    duplicate: (id: string) => Promise<ServicePackage>;
    delete: (id: string) => Promise<void>;
  };
  calendar: {
    getMonth: (month: number, year: number) => Promise<CalendarMonthData>;
  };
  dashboard: {
    getSummary: () => Promise<PhotographerDashboardSummary>;
  };
  activity: {
    list: (input?: {
      page?: number;
      limit?: number;
      type?: string;
      range?: string;
    }) => Promise<PaginatedPhotographerActivities>;
  };
  analytics: {
    getSummary: (range?: string) => Promise<PhotographerAnalyticsSummary>;
  };
  notifications: {
    list: () => Promise<StudioNotification[]>;
    markAllRead: () => Promise<StudioNotification[]>;
    markRead: (id: string) => Promise<StudioNotification[]>;
  };
  settings: {
    getPanel: typeof import("@/services/photographer/http/settings").photographerSettingsHttp.getPanel;
    updatePanel: typeof import("@/services/photographer/http/settings").photographerSettingsHttp.updatePanel;
    deactivate: typeof import("@/services/photographer/http/settings").photographerSettingsHttp.deactivate;
  };
  availability: typeof import("@/services/availability").photographerAvailabilityHttp;
};
