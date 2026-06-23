/** Central route path definitions — use these instead of hardcoded strings */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",

  onboarding: {
    role: "/onboarding/role",
    photographerProfile: "/onboarding/photographer-profile",
    clientProfile: "/onboarding/client-profile",
  },

  photographer: {
    root: "/photographer",
    dashboard: "/photographer/dashboard",
    calendar: "/photographer/calendar",
    bookings: "/photographer/bookings",
    bookingsNew: "/photographer/bookings/new",
    bookingDetail: (id: string) => `/photographer/bookings/${id}` as const,
    clients: "/photographer/clients",
    clientDetail: (id: string) => `/photographer/clients/${id}` as const,
    clientDetailTab: (id: string, tab: string) =>
      `/photographer/clients/${id}?tab=${tab}` as const,
    services: "/photographer/services",
    servicePackageNew: "/photographer/services/new",
    servicePackageEdit: (id: string) => `/photographer/services/${id}/edit` as const,
    payments: "/photographer/payments",
    paymentsForClient: (clientName: string) => {
      const search = new URLSearchParams({ q: clientName });
      return `/photographer/payments?${search.toString()}` as const;
    },
    paymentVerification: (params?: {
      verificationId?: string;
      bookingId?: string;
    }) => {
      const search = new URLSearchParams();
      if (params?.verificationId) {
        search.set("verification", params.verificationId);
      }
      if (params?.bookingId) {
        search.set("booking", params.bookingId);
      }
      const query = search.toString();
      return `/photographer/payments${query ? `?${query}` : ""}` as const;
    },
    galleries: "/photographer/galleries",
    galleriesForClient: (clientId: string) => {
      const search = new URLSearchParams({ client: clientId });
      return `/photographer/galleries?${search.toString()}` as const;
    },
    galleryNew: "/photographer/galleries/new",
    galleryNewForClient: (clientId: string) => {
      const search = new URLSearchParams({ client: clientId });
      return `/photographer/galleries/new?${search.toString()}` as const;
    },
    galleryNewForBooking: (bookingId: string) =>
      `/photographer/galleries/new?booking=${bookingId}` as const,
    galleryEdit: (id: string) => `/photographer/galleries/${id}/edit` as const,
    galleryDetail: (id: string) => `/photographer/galleries/${id}` as const,
    activity: "/photographer/activity",
    analytics: "/photographer/analytics",
    notifications: "/photographer/notifications",
    settings: "/photographer/settings",
  },

  client: {
    root: "/client",
    dashboard: "/client/dashboard",
    bookings: "/client/bookings",
    bookingDetail: (id: string) => `/client/bookings/${id}` as const,
    payments: "/client/payments",
    uploadReceipt: "/client/payments/upload",
    uploadReceiptForBooking: (bookingId: string) =>
      `/client/payments/upload?booking=${bookingId}` as const,
    uploadReceiptForPayment: (bookingId: string, paymentRequestId: string) =>
      `/client/payments/upload?booking=${bookingId}&payment=${paymentRequestId}` as const,
    galleries: "/client/galleries",
    galleryDetail: (id: string) => `/client/galleries/${id}` as const,
    notifications: "/client/notifications",
    bookSession: "/client/book",
  },
} as const;
