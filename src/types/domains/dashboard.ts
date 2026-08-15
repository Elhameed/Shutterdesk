export type DashboardStatIcon = "camera" | "calendar" | "users" | "clipboard";

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  change?: string;
  subtext?: string;
  icon: DashboardStatIcon;
  tone?: "alert" | "default";
};

export type UpcomingShoot = {
  id: string;
  clientName: string;
  shootType: string;
  date: string;
  time: string;
  location: string;
  status: "confirmed" | "paid";
  avatar: string;
};

export type ProfileCompletionItem = {
  id: string;
  label: string;
  completed: boolean;
  optional?: boolean;
};

export type RecentActivityType =
  | "booking"
  | "payment"
  | "gallery"
  | "client"
  | "service";

export type RecentActivity = {
  id: string;
  type: RecentActivityType;
  title: string;
  description: string;
  time: string;
  occurredAt?: string;
  href?: string;
};

export type PhotographerActivity = RecentActivity;

export type PaginatedPhotographerActivities = {
  items: PhotographerActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type PhotographerDashboardSummary = {
  user: {
    name: string;
    firstName: string;
    role: string;
    avatar: string;
    studioLogo?: string;
  };
  stats: DashboardStat[];
  upcomingShoots: UpcomingShoot[];
  profileCompletion: {
    percent: number;
    items: ProfileCompletionItem[];
  };
  recentActivity: RecentActivity[];
};

export type ClientDashboardSummary = {
  stats: {
    activeBookings: number;
    upcomingSessions: number;
    galleriesAvailable: number;
    pendingPayments: number;
    pendingPaymentsFormatted: string;
  };
  upcomingBookingId: string | null;
  readyGalleryId: string | null;
  obligations: Array<{
    id: string;
    bookingId: string;
    type: string;
    amount: number;
    status: string;
    dueDate: string | null;
    invoiceRef: string | null;
    bookingReference: string | null;
    bookingTitle: string | null;
  }>;
};
