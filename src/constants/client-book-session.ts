import { formatRwf } from "@/lib/currency";
import type {
  ServiceBadgeType,
  ServiceCategory,
  ServiceDurationKey,
  ServiceLocationType,
} from "@/types/domains/service";

export const CLIENT_BOOK_SESSION_COPY = {
  title: "Book a Session",
  subtitle: "Choose a package and request your preferred date.",
  steps: {
    package: "Choose Package",
    schedule: "Schedule",
    details: "Details",
  },
  packageStep: {
    heading: "Select your session type",
    subheading: "All sessions include professionally edited digital files.",
    selectPackage: "Select Package",
    selectedPackage: "Selected",
    readMore: "Read more",
    readLess: "Read less",
    customQuote: "Need a custom quote?",
    contactStudio: "Email our studio",
    noStudios:
      "No photographers are on Shutterdesk yet. Check back soon or register as a photographer to be the first studio.",
    noPackages:
      "This studio has not published any bookable packages yet. Try another studio or contact them directly.",
  },
  scheduleStep: {
    selectDate: "Select Date",
    availableTime: "Available Time",
    selected: (dayLabel: string) => `Selected: ${dayLabel}`,
    currentSelection: "Current Selection",
    continueToDetails: "Continue to Details",
    loadingSlots: "Loading available times…",
    noSlots: "No open slots on this day. Choose another date.",
  },
  detailsStep: {
    heading: "Session Details",
    subheading:
      "Confirm your contact details and tell us where the session will take place.",
    contactHeading: "Your contact details",
    contactHint: "From your Shutterdesk profile. Update anytime in Settings.",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    location: "Location / Venue Address",
    locationPlaceholder: "Enter session address",
    notes: "Special Requests / Notes",
    notesPlaceholder:
      "Tell us about specific shots, outfit changes, or lighting preferences...",
    bookingSummary: "Booking Summary",
    confirmedSlot: "Confirmed Slot",
    sessionFee: "Session Fee",
    locationFee: "Location Fee",
    total: "Total",
    reserveNote:
      "Your session is reserved for 15 minutes. Complete this step to secure your date.",
    reviewSubmit: "Review & Submit",
  },
  back: "Back",
  continue: "Continue",
  confirm: "Submit Booking Request",
  success: "Booking request submitted!",
} as const;

export const DURATION_BADGE_LABELS: Record<ServiceDurationKey, string> = {
  "30min": "30 MIN",
  "1hr": "1 HOUR",
  "2hr": "2 HOURS",
  "4hr": "4 HOURS",
  fullday: "8 HOURS",
};

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  wedding: "Wedding",
  portrait: "Portrait",
  commercial: "Commercial",
  editorial: "Editorial",
};

export const LOCATION_TYPE_LABELS: Record<ServiceLocationType, string> = {
  studio: "Studio",
  outdoor: "Outdoor",
  client: "Your location",
  hybrid: "Studio + Outdoor",
};

/** Client-facing "featured" badges. Visibility badges (public/private/…) are excluded. */
export const FEATURED_BADGE_LABELS: Partial<Record<ServiceBadgeType, string>> = {
  popular: "Most Popular",
  featured: "Featured",
  new: "New",
};

/** Priority order for choosing which featured badge to surface on a card. */
export const FEATURED_BADGE_PRIORITY: ServiceBadgeType[] = [
  "popular",
  "featured",
  "new",
];

export const PACKAGE_DESCRIPTION_LIMIT = 120;

export const BOOK_SESSION_TIME_SLOTS = [
  "9:00 AM",
  "10:30 AM",
  "2:00 PM",
  "3:30 PM",
  "5:00 PM",
] as const;

export const BOOK_SESSION_PACKAGE_ORDER = ["2", "4", "1"] as const;

export function formatBookSessionDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatBookSessionDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatRwfPrice(amount: number): string {
  return formatRwf(amount);
}
