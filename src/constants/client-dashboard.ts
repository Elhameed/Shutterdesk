import {
  Bell,
  CalendarCheck,
  CreditCard,
  Image,
  LayoutDashboard,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type ClientNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  available: boolean;
  highlight?: boolean;
};

export const CLIENT_NAV_ITEMS: ClientNavItem[] = [
  {
    label: "Dashboard",
    to: ROUTES.client.dashboard,
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "My Bookings",
    to: ROUTES.client.bookings,
    icon: CalendarCheck,
    available: true,
  },
  {
    label: "Payments",
    to: ROUTES.client.payments,
    icon: CreditCard,
    available: true,
  },
  {
    label: "Galleries",
    to: ROUTES.client.galleries,
    icon: Image,
    available: true,
  },
  {
    label: "Notifications",
    to: ROUTES.client.notifications,
    icon: Bell,
    available: true,
  },
];

export const CLIENT_BOOK_SESSION_NAV: ClientNavItem = {
  label: "Book Session",
  to: ROUTES.client.bookSession,
  icon: Plus,
  available: true,
  highlight: true,
};

export const CLIENT_DASHBOARD_COPY = {
  title: "Dashboard",
  subtitle: "Your sessions, payments, and galleries in one place.",
  greeting: (name: string) => `Welcome back, ${name.split(" ")[0]}`,
  upcomingSession: "Upcoming Session",
  noUpcomingSession: "No upcoming session",
  viewBooking: "View booking",
  contactPhotographer: "Contact photographer",
  outstandingBalance: "Outstanding Balance",
  payNow: "Make a payment",
  accountUpToDate: "Account up to date",
  viewBilling: "View Billing History",
  galleryReady: "Gallery Ready",
  viewGallery: "View gallery",
  photosReady: (count: number) => `${count} photos ready to view`,
  recentNotifications: "Recent Updates",
  viewAllNotifications: "View all",
  markAllRead: "Mark all as read",
  quickActions: {
    title: "Quick Actions",
    bookSession: "Book Session",
    uploadReceipt: "Upload Receipt",
    viewGalleries: "View Galleries",
  },
  needHelp: {
    title: "Need help?",
    body: "Reach Imani Uwase Photography for booking or gallery questions.",
    cta: "Email support",
  },
  stats: {
    activeBookings: "Active Bookings",
    upcomingSessions: "Upcoming Sessions",
    galleriesAvailable: "Galleries Available",
    pendingPayments: "Pending Payments",
    statusTag: "Status",
  },
} as const;
