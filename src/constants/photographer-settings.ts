export type SettingsTab =
  | "profile"
  | "studio"
  | "payment"
  | "notifications"
  | "gallery"
  | "booking"
  | "security"
  | "billing";

export const SETTINGS_TABS: SettingsTab[] = [
  "profile",
  "studio",
  "payment",
  "notifications",
  "gallery",
  "booking",
  "security",
  "billing",
];

export const BRAND_COLOR_PRESETS = ["#795900", "#1A1A1A", "#1E3A5F"] as const;

export const NOTIFICATION_EVENT_KEYS = [
  "newBooking",
  "paymentReceived",
  "galleryFavorites",
] as const;

export const NOTIFICATION_CHANNELS = ["email", "sms", "inApp"] as const;

export const GALLERY_WATERMARK_KEYS = [
  "watermarkGridView",
  "watermarkRemoveOnPaid",
  "allowClientDisableWatermark",
] as const;

export type NotificationEventKey = (typeof NOTIFICATION_EVENT_KEYS)[number];
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];
export type GalleryWatermarkKey = (typeof GALLERY_WATERMARK_KEYS)[number];

export const SETTINGS_COPY = {
  title: "App settings",
  subtitle: "Manage your studio preferences",
  breadcrumbRoot: "Settings",
  resetChanges: "Reset changes",
  saveChanges: "Save changes",
  comingSoon: "Coming soon",
  saved: "Changes saved",
  tabs: {
    profile: "Profile",
    studio: "Studio settings",
    payment: "Payment settings",
    notifications: "Notifications",
    gallery: "Gallery & assets",
    booking: "Booking & availability",
    security: "Security",
    billing: "Billing & storage",
  },
  storage: {
    label: "Storage",
    used: (used: number, total: number) => `${used} GB of ${total} GB used`,
  },
  profile: {
    title: "Public profile",
    subtitle: "Update your personal information and how clients see you.",
    avatar: "Avatar",
    fullName: "Full name",
    displayName: "Display name",
    professionalBio: "Professional bio",
    contactEmail: "Contact email",
    socialLinks: "Social links",
    instagramPlaceholder: "instagram.com/yourhandle",
    websitePlaceholder: "yourstudio.com",
  },
  studio: {
    title: "Studio brand",
    subtitle: "Customize your business identity and client-facing branding.",
    studioName: "Studio name",
    specialization: "Photography specialization",
    specializationPlaceholder: "Select specialization...",
    brandAccentColor: "Brand accent color",
    primaryLogo: "Primary logo",
    logoDropTitle: "Drag logo here or browse",
    logoDropHint: "PNG, SVG preferred (max 2MB)",
    galleryWatermark: "Gallery watermark",
    watermarkDropTitle: "Upload watermark overlay",
    watermarkDropHint: "Transparent PNG only",
  },
  payment: {
    title: "Payments & billing",
    subtitle: "Configure how you receive payments from your clients.",
    bankTransfer: {
      title: "Bank transfer (manual)",
      description: "Direct bank transfers for large bookings",
      accountName: "Account name",
      accountNumber: "Account number",
    },
    mobileMoney: {
      title: "Mobile money & QR",
      description: "MTN MoMo payments for quick client deposits",
      accountName: "MoMo account name",
      accountNamePlaceholder: "e.g. Golden Hour Studio Kigali",
      phoneNumber: "MoMo number",
      phoneNumberPlaceholder: "+250 788 000 000",
      merchantCode: "Merchant code",
      merchantCodePlaceholder: "e.g. 652930 (optional)",
      provider: "Mobile network",
    },
    depositRequirements: "Deposit requirements",
    depositOptions: {
      half: {
        title: "Require 50% deposit",
        description: "Mandatory payment to confirm booking dates.",
      },
      none: {
        title: "No initial deposit",
        description: "Full payment due upon project completion.",
      },
    },
  },
  notifications: {
    title: "Notification preferences",
    subtitle: "Choose how and when you want to be notified.",
    columns: {
      eventType: "Event type",
      email: "Email",
      sms: "SMS",
      inApp: "In-App",
    },
    events: {
      newBooking: {
        title: "New booking",
        description: "When a client books a session",
      },
      paymentReceived: {
        title: "Payment received",
        description: "Invoice settlements",
      },
      galleryFavorites: {
        title: "Gallery favorites",
        description: "Client photo selections",
      },
    },
  },
  gallery: {
    title: "Gallery & assets",
    subtitle: "Global default settings for your client-facing galleries.",
    allowDownloads: {
      title: "Allow downloads",
      description:
        "Clients can download high-resolution versions of their photos by default.",
    },
    passwordProtection: {
      title: "Password protection",
      description:
        "Automatically generate a unique password for every new gallery created.",
    },
    watermarkPersistence: "Watermark persistence",
    watermarkOptions: {
      watermarkGridView: "Apply watermark to Grid View",
      watermarkRemoveOnPaid: "Remove watermark on Paid Downloads",
      allowClientDisableWatermark: "Allow clients to disable watermarks in view",
    },
  },
  booking: {
    title: "Booking & availability",
    subtitle: "Set your booking horizon, session timing, and cancellation policy.",
    maxDaysAhead: "Booking horizon (days)",
    maxDaysAheadHint: "How far in advance clients can book sessions.",
    slotInterval: "Default session slot length (minutes)",
    bufferMinutes: "Buffer between sessions (minutes)",
    cancellationPolicy: "Cancellation policy",
    cancellationPlaceholder:
      "e.g. Cancellations within 48 hours of the session forfeit the deposit.",
    calendarLink: "Manage blocked days in calendar",
  },
  security: {
    title: "Security & access",
    subtitle: "Keep your account and studio data secure.",
    changePassword: "Change password",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    twoFactor: {
      title: "Two-Factor authentication (2FA)",
      description: "Add an extra layer of security using an authenticator app.",
      comingSoon: "Coming soon",
    },
    account: {
      title: "Account",
      description:
        "Deactivate your studio account. Your client data remains stored for support review.",
      deactivate: "Deactivate account",
      deactivateConfirm:
        "Are you sure you want to deactivate your studio account? You will be signed out.",
    },
    session: {
      title: "Session",
      description: "Sign out of your account on this device.",
    },
  },
  billing: {
    title: "Subscription plan",
    subtitle: "Manage your billing cycle and storage limits.",
    proPlan: "Pro plan",
    upgrade: {
      title: "Scale your studio with unlimited storage",
      description:
        "Get RAW file support, white-labeled client portals, and priority support.",
      action: "Upgrade now",
    },
    billingHistory: "Billing history",
    columns: {
      date: "Date",
      invoice: "Invoice",
      amount: "Amount",
      status: "Status",
      action: "Action",
    },
    status: {
      paid: "Paid",
    },
    downloadInvoice: "Download invoice",
  },
  placeholders: {
    studio: {
      title: "Studio settings",
      description:
        "Configure your studio name, business hours, and default booking policies.",
    },
    payment: {
      title: "Payment settings",
      description:
        "Manage deposit rules, accepted payment methods, and invoice templates.",
    },
    notifications: {
      title: "Notification preferences",
      description:
        "Choose which email and in-app alerts you receive for bookings and payments.",
    },
    gallery: {
      title: "Gallery & assets",
      description:
        "Set default gallery visibility, watermarking, and file upload preferences.",
    },
    security: {
      title: "Security",
      description:
        "Update your password, enable two-factor authentication, and review active sessions.",
    },
    billing: {
      title: "Billing & storage",
      description:
        "Review your Shutterdesk plan, payment history, and storage allocation.",
    },
  },
} as const;
