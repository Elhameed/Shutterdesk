import {
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CreditCard,
  Image,
  LayoutDashboard,
  Settings,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

export type PhotographerNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  available: boolean;
};

export const PHOTOGRAPHER_NAV_ITEMS: PhotographerNavItem[] = [
  {
    label: "Dashboard",
    to: ROUTES.photographer.dashboard,
    icon: LayoutDashboard,
    available: true,
  },
  {
    label: "Calendar",
    to: ROUTES.photographer.calendar,
    icon: Calendar,
    available: true,
  },
  {
    label: "Bookings",
    to: ROUTES.photographer.bookings,
    icon: Ticket,
    available: true,
  },
  {
    label: "Clients",
    to: ROUTES.photographer.clients,
    icon: Users,
    available: true,
  },
  {
    label: "Services",
    to: ROUTES.photographer.services,
    icon: Camera,
    available: true,
  },
  {
    label: "Payments",
    to: ROUTES.photographer.payments,
    icon: CreditCard,
    available: true,
  },
  {
    label: "Galleries",
    to: ROUTES.photographer.galleries,
    icon: Image,
    available: true,
  },
  {
    label: "Analytics",
    to: ROUTES.photographer.analytics,
    icon: BarChart3,
    available: true,
  },
];

export const PHOTOGRAPHER_ACCOUNT_NAV_ITEMS: PhotographerNavItem[] = [
  {
    label: "Notifications",
    to: ROUTES.photographer.notifications,
    icon: Bell,
    available: true,
  },
  {
    label: "Settings",
    to: ROUTES.photographer.settings,
    icon: Settings,
    available: true,
  },
];

export const PHOTOGRAPHER_DASHBOARD_COPY = {
  greeting: {
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    subtitle: "Here's what's happening with your studio today.",
  },
  upcomingShoots: {
    title: "Upcoming Shoots",
    viewCalendar: "View Calendar",
    columns: {
      client: "Client",
      dateLocation: "Date & Location",
      status: "Status",
    },
    statusConfirmed: "Confirmed",
    statusPaid: "Paid",
  },
  quickActions: {
    title: "Quick Actions",
    newBooking: "New Booking",
    reviewPayments: "Review Payments",
    createGallery: "Create Gallery",
    addClient: "Add Client",
  },
  profileCompletion: {
    title: "Profile Completion",
  },
  recentActivity: {
    title: "Recent Activity",
    viewAll: "View all activity",
  },
} as const;
