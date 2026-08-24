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
  title: "App Settings",
  subtitle: "Manage your studio preferences",
  breadcrumbRoot: "Settings",
  resetChanges: "Reset Changes",
  saveChanges: "Save changes",
  comingSoon: "Coming soon",
  saved: "Changes saved",
  tabs: {
    profile: "Profile",
    studio: "Studio Settings",
    payment: "Payment Settings",
    notifications: "Notifications",
    gallery: "Gallery & Assets",
    booking: "Booking & Availability",
    security: "Security",
    billing: "Billing & Storage",
  },
  storage: {
    label: "Storage",
    used: (used: number, total: number) => `${used} GB of ${total} GB used`,
  },
  profile: {
    title: "Public Profile",
    subtitle: "Update your personal information and how clients see you.",
    avatar: "Avatar",
    fullName: "Full Name",
    displayName: "Display Name",
    professionalBio: "Professional Bio",
    contactEmail: "Contact Email",
    socialLinks: "Social Links",
    instagramPlaceholder: "instagram.com/yourhandle",
    websitePlaceholder: "yourstudio.com",
  },
  studio: {
    title: "Studio Brand",
    subtitle: "Customize your business identity and client-facing branding.",
    studioName: "Studio Name",
    specialization: "Photography Specialization",
    specializationPlaceholder: "Select specialization...",
    brandAccentColor: "Brand Accent Color",
    primaryLogo: "Primary Logo",
    logoDropTitle: "Drag logo here or browse",
    logoDropHint: "PNG, SVG preferred (max 2MB)",
    galleryWatermark: "Gallery Watermark",
    watermarkDropTitle: "Upload watermark overlay",
    watermarkDropHint: "Transparent PNG only",
  },
  payment: {
    title: "Payments & Billing",
    subtitle: "Configure how you receive payments from your clients.",
    bankTransfer: {
      title: "Bank Transfer (Manual)",
      description: "Direct bank transfers for large bookings",
      accountName: "Account Name",
      accountNumber: "Account Number",
    },
    mobileMoney: {
      title: "Mobile Money & QR",
      description: "MTN MoMo payments for quick client deposits",
      accountName: "MoMo Account Name",
      accountNamePlaceholder: "e.g. Golden Hour Studio Kigali",
      phoneNumber: "MoMo Number",
      phoneNumberPlaceholder: "+250 788 000 000",
      merchantCode: "Merchant Code",
      merchantCodePlaceholder: "e.g. 652930 (optional)",
      provider: "Mobile Network",
    },
    depositRequirements: "Deposit Requirements",
    depositOptions: {
      half: {
        title: "Require 50% Deposit",
        description: "Mandatory payment to confirm booking dates.",
      },
      none: {
        title: "No Initial Deposit",
        description: "Full payment due upon project completion.",
      },
    },
  },
  notifications: {
    title: "Notification Preferences",
    subtitle: "Choose how and when you want to be notified.",
    columns: {
      eventType: "Event Type",
      email: "Email",
      sms: "SMS",
      inApp: "In-App",
    },
    events: {
      newBooking: {
        title: "New Booking",
        description: "When a client books a session",
      },
      paymentReceived: {
        title: "Payment Received",
        description: "Invoice settlements",
      },
      galleryFavorites: {
        title: "Gallery Favorites",
        description: "Client photo selections",
      },
    },
  },
  gallery: {
    title: "Gallery & Assets",
    subtitle: "Global default settings for your client-facing galleries.",
    allowDownloads: {
      title: "Allow Downloads",
      description:
        "Clients can download high-resolution versions of their photos by default.",
    },
    passwordProtection: {
      title: "Password Protection",
      description:
        "Automatically generate a unique password for every new gallery created.",
    },
    watermarkPersistence: "Watermark Persistence",
    watermarkOptions: {
      watermarkGridView: "Apply watermark to Grid View",
      watermarkRemoveOnPaid: "Remove watermark on Paid Downloads",
      allowClientDisableWatermark: "Allow clients to disable watermarks in view",
    },
  },
  booking: {
    title: "Booking & Availability",
    subtitle: "Set your booking horizon, session timing, and cancellation policy.",
    maxDaysAhead: "Booking horizon (days)",
    maxDaysAheadHint: "How far in advance clients can book sessions.",
    slotInterval: "Default session slot length (minutes)",
    bufferMinutes: "Buffer between sessions (minutes)",
    cancellationPolicy: "Cancellation policy",
    cancellationPlaceholder:
      "e.g. Cancellations within 48 hours of the session forfeit the deposit.",
    calendarLink: "Manage blocked days in Calendar",
  },
  security: {
    title: "Security & Access",
    subtitle: "Keep your account and studio data secure.",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    twoFactor: {
      title: "Two-Factor Authentication (2FA)",
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
    title: "Subscription Plan",
    subtitle: "Manage your billing cycle and storage limits.",
    proPlan: "Pro Plan",
    upgrade: {
      title: "Scale your studio with Unlimited Storage",
      description:
        "Get RAW file support, white-labeled client portals, and priority support.",
      action: "Upgrade Now",
    },
    billingHistory: "Billing History",
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
      title: "Studio Settings",
      description:
        "Configure your studio name, business hours, and default booking policies.",
    },
    payment: {
      title: "Payment Settings",
      description:
        "Manage deposit rules, accepted payment methods, and invoice templates.",
    },
    notifications: {
      title: "Notification Preferences",
      description:
        "Choose which email and in-app alerts you receive for bookings and payments.",
    },
    gallery: {
      title: "Gallery & Assets",
      description:
        "Set default gallery visibility, watermarking, and file upload preferences.",
    },
    security: {
      title: "Security",
      description:
        "Update your password, enable two-factor authentication, and review active sessions.",
    },
    billing: {
      title: "Billing & Storage",
      description:
        "Review your Shutterdesk plan, payment history, and storage allocation.",
    },
  },
} as const;
