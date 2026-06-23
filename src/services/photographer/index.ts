import type { PhotographerApi } from "@/services/photographer/types";
import { photographerActivityHttp } from "@/services/photographer/http/activity";
import { photographerAnalyticsHttp } from "@/services/photographer/http/analytics";
import { photographerBookingsHttp } from "@/services/photographer/http/bookings";
import { photographerCalendarHttp } from "@/services/photographer/http/calendar";
import { photographerClientsHttp } from "@/services/photographer/http/clients";
import { photographerDashboardHttp } from "@/services/photographer/http/dashboard";
import { photographerGalleriesHttp } from "@/services/photographer/http/galleries";
import { photographerNotificationsHttp } from "@/services/photographer/http/notifications";
import { photographerPaymentsHttp } from "@/services/photographer/http/payments";
import { photographerServicesHttp } from "@/services/photographer/http/services";
import { photographerSettingsHttp } from "@/services/photographer/http/settings";
import { photographerAvailabilityHttp } from "@/services/availability";

export const photographerApi: PhotographerApi = {
  bookings: photographerBookingsHttp,
  clients: photographerClientsHttp,
  payments: photographerPaymentsHttp,
  galleries: photographerGalleriesHttp,
  services: photographerServicesHttp,
  calendar: photographerCalendarHttp,
  dashboard: photographerDashboardHttp,
  activity: photographerActivityHttp,
  analytics: photographerAnalyticsHttp,
  notifications: photographerNotificationsHttp,
  settings: photographerSettingsHttp,
  availability: photographerAvailabilityHttp,
};

export type {
  AddClientInput,
  CreateBookingInput,
  PhotographerApi,
} from "@/services/photographer/types";
