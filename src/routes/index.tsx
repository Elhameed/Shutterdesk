import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AuthLayout, ClientLayout, PhotographerLayout, PublicLayout } from "@/components/layout";
import { ROUTES } from "@/constants/routes";
import { SITE_PUBLICLY_ACCESSIBLE } from "@/constants/site-access";
import { GuestRoute, ProtectedRoute } from "@/routes/ProtectedRoute";
import { SiteUnavailablePage } from "@/pages/SiteUnavailablePage";
import {
  ClientBookSessionPage,
  ClientBookingDetailPage,
  ClientBookingsPage,
  ClientDashboardPage,
  ClientGalleriesPage,
  ClientGalleryDetailPage,
  ClientNotificationsPage,
  ClientPaymentsPage,
  ClientProfilePage,
  ClientUploadReceiptPage,
  LandingPage,
  LoginPage,
  NotFoundPage,
  PhotographerActivityPage,
  PhotographerAnalyticsPage,
  PhotographerBookingDetailPage,
  PhotographerBookingsPage,
  PhotographerCalendarPage,
  PhotographerClientProfilePage,
  PhotographerClientsPage,
  PhotographerDashboardPage,
  PhotographerEditGalleryPage,
  PhotographerEditServicePackagePage,
  PhotographerGalleriesPage,
  PhotographerGalleryDetailPage,
  PhotographerNewBookingPage,
  PhotographerNewGalleryPage,
  PhotographerNewServicePackagePage,
  PhotographerNotificationsPage,
  PhotographerPaymentsPage,
  PhotographerProfilePage,
  PhotographerServicesPage,
  PhotographerSettingsPage,
  RegisterPage,
  RoleSelectionPage,
} from "@/routes/lazy-pages";

/** Full application routes — unchanged; restore by setting SITE_PUBLICLY_ACCESSIBLE to true. */
export const liveRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [{ path: ROUTES.home, element: <LandingPage /> }],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.login,
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: ROUTES.register,
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
    ],
  },
  {
    path: ROUTES.onboarding.role,
    element: (
      <ProtectedRoute>
        <RoleSelectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.onboarding.photographerProfile,
    element: (
      <ProtectedRoute role="photographer">
        <PhotographerProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: ROUTES.onboarding.clientProfile,
    element: (
      <ProtectedRoute role="client">
        <ClientProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    element: (
      <ProtectedRoute role="photographer">
        <PhotographerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.photographer.dashboard,
        element: <PhotographerDashboardPage />,
      },
      {
        path: ROUTES.photographer.activity,
        element: <PhotographerActivityPage />,
      },
      {
        path: ROUTES.photographer.calendar,
        element: <PhotographerCalendarPage />,
      },
      {
        path: ROUTES.photographer.bookings,
        element: <PhotographerBookingsPage />,
      },
      {
        path: ROUTES.photographer.bookingsNew,
        element: <PhotographerNewBookingPage />,
      },
      {
        path: `${ROUTES.photographer.bookings}/:id`,
        element: <PhotographerBookingDetailPage />,
      },
      {
        path: ROUTES.photographer.clients,
        element: <PhotographerClientsPage />,
      },
      {
        path: `${ROUTES.photographer.clients}/:id`,
        element: <PhotographerClientProfilePage />,
      },
      {
        path: ROUTES.photographer.services,
        element: <PhotographerServicesPage />,
      },
      {
        path: ROUTES.photographer.servicePackageNew,
        element: <PhotographerNewServicePackagePage />,
      },
      {
        path: `${ROUTES.photographer.services}/:id/edit`,
        element: <PhotographerEditServicePackagePage />,
      },
      {
        path: ROUTES.photographer.payments,
        element: <PhotographerPaymentsPage />,
      },
      {
        path: ROUTES.photographer.galleries,
        element: <PhotographerGalleriesPage />,
      },
      {
        path: ROUTES.photographer.galleryNew,
        element: <PhotographerNewGalleryPage />,
      },
      {
        path: `${ROUTES.photographer.galleries}/:id/edit`,
        element: <PhotographerEditGalleryPage />,
      },
      {
        path: `${ROUTES.photographer.galleries}/:id`,
        element: <PhotographerGalleryDetailPage />,
      },
      {
        path: ROUTES.photographer.analytics,
        element: <PhotographerAnalyticsPage />,
      },
      {
        path: ROUTES.photographer.notifications,
        element: <PhotographerNotificationsPage />,
      },
      {
        path: ROUTES.photographer.settings,
        element: <PhotographerSettingsPage />,
      },
    ],
  },
  {
    element: (
      <ProtectedRoute role="client">
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.client.root,
        element: <Navigate to={ROUTES.client.dashboard} replace />,
      },
      {
        path: ROUTES.client.dashboard,
        element: <ClientDashboardPage />,
      },
      {
        path: ROUTES.client.bookings,
        element: <ClientBookingsPage />,
      },
      {
        path: `${ROUTES.client.bookings}/:id`,
        element: <ClientBookingDetailPage />,
      },
      {
        path: ROUTES.client.payments,
        element: <ClientPaymentsPage />,
      },
      {
        path: ROUTES.client.uploadReceipt,
        element: <ClientUploadReceiptPage />,
      },
      {
        path: ROUTES.client.galleries,
        element: <ClientGalleriesPage />,
      },
      {
        path: `${ROUTES.client.galleries}/:id`,
        element: <ClientGalleryDetailPage />,
      },
      {
        path: ROUTES.client.notifications,
        element: <ClientNotificationsPage />,
      },
      {
        path: ROUTES.client.bookSession,
        element: <ClientBookSessionPage />,
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
];

const maintenanceRoutes: RouteObject[] = [
  { path: "*", element: <SiteUnavailablePage /> },
];

export const routes: RouteObject[] = SITE_PUBLICLY_ACCESSIBLE
  ? liveRoutes
  : maintenanceRoutes;
