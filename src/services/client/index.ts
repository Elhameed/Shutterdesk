import { clientBookingsHttp } from "@/services/client/http/bookings";
import { clientDashboardHttp } from "@/services/client/http/dashboard";
import { clientGalleriesHttp } from "@/services/client/http/galleries";
import { clientNotificationsHttp } from "@/services/client/http/notifications";
import { clientPaymentsHttp } from "@/services/client/http/payments";
import { clientServicesHttp } from "@/services/client/http/services";
import { clientSettingsHttp } from "@/services/client/http/settings";
import { clientStudiosHttp } from "@/services/client/http/studios";
import { clientAvailabilityHttp } from "@/services/availability";
import type { ClientApi } from "@/services/client/types";

export const clientApi: ClientApi = {
  bookings: clientBookingsHttp,
  payments: clientPaymentsHttp,
  galleries: clientGalleriesHttp,
  notifications: clientNotificationsHttp,
  dashboard: clientDashboardHttp,
  services: clientServicesHttp,
  studios: clientStudiosHttp,
  settings: clientSettingsHttp,
  availability: clientAvailabilityHttp,
};
export type {
  ClientApi,
  ClientOutstandingSummary,
  CreateClientBookingInput,
  UploadReceiptInput,
} from "@/services/client/types";
