import { lazy, type ComponentType } from "react";

function lazyNamed<T extends ComponentType<unknown>>(
  factory: () => Promise<Record<string, T>>,
  exportName: string,
) {
  return lazy(() => factory().then((module) => ({ default: module[exportName] })));
}

export const LandingPage = lazyNamed(
  () => import("@/pages/public/LandingPage"),
  "LandingPage",
);
export const LoginPage = lazyNamed(() => import("@/pages/public/LoginPage"), "LoginPage");
export const RegisterPage = lazyNamed(
  () => import("@/pages/public/RegisterPage"),
  "RegisterPage",
);
export const ClientBookSessionPage = lazyNamed(
  () => import("@/pages/client/ClientBookSessionPage"),
  "ClientBookSessionPage",
);
export const ClientBookingDetailPage = lazyNamed(
  () => import("@/pages/client/ClientBookingDetailPage"),
  "ClientBookingDetailPage",
);
export const ClientBookingsPage = lazyNamed(
  () => import("@/pages/client/ClientBookingsPage"),
  "ClientBookingsPage",
);
export const ClientDashboardPage = lazyNamed(
  () => import("@/pages/client/ClientDashboardPage"),
  "ClientDashboardPage",
);
export const ClientGalleriesPage = lazyNamed(
  () => import("@/pages/client/ClientGalleriesPage"),
  "ClientGalleriesPage",
);
export const ClientGalleryDetailPage = lazyNamed(
  () => import("@/pages/client/ClientGalleryDetailPage"),
  "ClientGalleryDetailPage",
);
export const ClientNotificationsPage = lazyNamed(
  () => import("@/pages/client/ClientNotificationsPage"),
  "ClientNotificationsPage",
);
export const ClientPaymentsPage = lazyNamed(
  () => import("@/pages/client/ClientPaymentsPage"),
  "ClientPaymentsPage",
);
export const ClientUploadReceiptPage = lazyNamed(
  () => import("@/pages/client/ClientUploadReceiptPage"),
  "ClientUploadReceiptPage",
);
export const ClientProfilePage = lazyNamed(
  () => import("@/pages/onboarding/ClientProfilePage"),
  "ClientProfilePage",
);
export const PhotographerProfilePage = lazyNamed(
  () => import("@/pages/onboarding/PhotographerProfilePage"),
  "PhotographerProfilePage",
);
export const RoleSelectionPage = lazyNamed(
  () => import("@/pages/onboarding/RoleSelectionPage"),
  "RoleSelectionPage",
);
export const PhotographerBookingDetailPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerBookingDetailPage"),
  "PhotographerBookingDetailPage",
);
export const PhotographerActivityPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerActivityPage"),
  "PhotographerActivityPage",
);
export const PhotographerAnalyticsPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerAnalyticsPage"),
  "PhotographerAnalyticsPage",
);
export const PhotographerBookingsPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerBookingsPage"),
  "PhotographerBookingsPage",
);
export const PhotographerNewBookingPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerNewBookingPage"),
  "PhotographerNewBookingPage",
);
export const PhotographerEditServicePackagePage = lazyNamed(
  () => import("@/pages/photographer/PhotographerEditServicePackagePage"),
  "PhotographerEditServicePackagePage",
);
export const PhotographerNewServicePackagePage = lazyNamed(
  () => import("@/pages/photographer/PhotographerNewServicePackagePage"),
  "PhotographerNewServicePackagePage",
);
export const PhotographerPaymentsPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerPaymentsPage"),
  "PhotographerPaymentsPage",
);
export const PhotographerClientProfilePage = lazyNamed(
  () => import("@/pages/photographer/PhotographerClientProfilePage"),
  "PhotographerClientProfilePage",
);
export const PhotographerClientsPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerClientsPage"),
  "PhotographerClientsPage",
);
export const PhotographerCalendarPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerCalendarPage"),
  "PhotographerCalendarPage",
);
export const PhotographerDashboardPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerDashboardPage"),
  "PhotographerDashboardPage",
);
export const PhotographerGalleriesPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerGalleriesPage"),
  "PhotographerGalleriesPage",
);
export const PhotographerEditGalleryPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerEditGalleryPage"),
  "PhotographerEditGalleryPage",
);
export const PhotographerGalleryDetailPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerGalleryDetailPage"),
  "PhotographerGalleryDetailPage",
);
export const PhotographerNotificationsPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerNotificationsPage"),
  "PhotographerNotificationsPage",
);
export const PhotographerNewGalleryPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerNewGalleryPage"),
  "PhotographerNewGalleryPage",
);
export const PhotographerSettingsPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerSettingsPage"),
  "PhotographerSettingsPage",
);
export const PhotographerServicesPage = lazyNamed(
  () => import("@/pages/photographer/PhotographerServicesPage"),
  "PhotographerServicesPage",
);
export const NotFoundPage = lazyNamed(() => import("@/pages/NotFoundPage"), "NotFoundPage");
