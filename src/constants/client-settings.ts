export type ClientSettingsTab = "profile" | "notifications" | "security";

export const CLIENT_SETTINGS_TABS: ClientSettingsTab[] = [
  "profile",
  "notifications",
  "security",
];

export const CLIENT_NOTIFICATION_EVENT_KEYS = [
  "bookingUpdates",
  "paymentUpdates",
  "galleryUpdates",
] as const;

export const CLIENT_NOTIFICATION_CHANNELS = ["email", "sms", "inApp"] as const;

export type ClientNotificationEventKey =
  (typeof CLIENT_NOTIFICATION_EVENT_KEYS)[number];
export type ClientNotificationChannel =
  (typeof CLIENT_NOTIFICATION_CHANNELS)[number];

export type ClientNotificationChannelPrefs = {
  email: boolean;
  sms: boolean;
  inApp: boolean;
};

export type ClientNotificationSettings = {
  [K in ClientNotificationEventKey]: ClientNotificationChannelPrefs;
};

export const DEFAULT_CLIENT_NOTIFICATION_PREFS: ClientNotificationSettings = {
  bookingUpdates: { email: true, sms: true, inApp: true },
  paymentUpdates: { email: true, sms: false, inApp: true },
  galleryUpdates: { email: true, sms: false, inApp: true },
};

export function normalizeClientNotificationSettings(
  values: Partial<ClientNotificationSettings> | null | undefined,
): ClientNotificationSettings {
  const source = values ?? {};

  return CLIENT_NOTIFICATION_EVENT_KEYS.reduce((acc, eventKey) => {
    const event = source[eventKey] ?? DEFAULT_CLIENT_NOTIFICATION_PREFS[eventKey];
    acc[eventKey] = {
      email: event.email ?? DEFAULT_CLIENT_NOTIFICATION_PREFS[eventKey].email,
      sms: event.sms ?? DEFAULT_CLIENT_NOTIFICATION_PREFS[eventKey].sms,
      inApp: event.inApp ?? DEFAULT_CLIENT_NOTIFICATION_PREFS[eventKey].inApp,
    };
    return acc;
  }, {} as ClientNotificationSettings);
}

export const CLIENT_SETTINGS_COPY = {
  title: "Account Settings",
  subtitle: "Manage your profile, notifications, and security in one place.",
  saveChanges: "Save Changes",
  saveNotifications: "Save Preferences",
  updatePassword: "Update Password",
  cancel: "Close",
  saved: "Your settings have been updated.",
  passwordUpdated: "Your password has been updated.",
  tabs: {
    profile: "Profile",
    notifications: "Notifications",
    security: "Security",
  },
  profile: {
    fullName: "Full Name",
    email: "Email Address",
    emailHint: "Your sign-in email cannot be changed here.",
    phone: "Phone Number",
    phonePlaceholder: "+250 788 000 000",
    address: "Location",
    addressPlaceholder: "e.g. Kigali, Rwanda",
    interests: "Photography Interests",
    profilePhoto: "Profile Photo",
    profilePhotoHint: "Recommended: Square JPG or PNG, max 5MB",
  },
  notifications: {
    title: "Notification Preferences",
    subtitle: "Choose how Shutterdesk keeps you updated about bookings and galleries.",
    columns: {
      eventType: "Event Type",
      email: "Email",
      sms: "SMS",
      inApp: "In-App",
    },
    events: {
      bookingUpdates: {
        title: "Booking Updates",
        description: "Confirmations, schedule changes, and session reminders.",
      },
      paymentUpdates: {
        title: "Payment Updates",
        description: "Deposit approvals, receipt reviews, and balance reminders.",
      },
      galleryUpdates: {
        title: "Gallery Updates",
        description: "When your photos are ready to view or download.",
      },
    },
  },
  security: {
    title: "Security",
    subtitle: "Update your password and manage your active session.",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    passwordMismatch: "New passwords do not match.",
    passwordTooShort: "Password must be at least 8 characters.",
  },
  validation: {
    fullName: "Please enter your full name.",
    phone: "Please enter a valid Rwanda phone number (e.g. +250 788 000 000).",
    address: "Please enter your location.",
    interests: "Please select at least one photography interest.",
  },
  account: {
    title: "Account",
    description: "Deactivate your Shutterdesk client account. Your bookings and galleries remain accessible to your photographers.",
    deactivate: "Deactivate account",
    deactivateConfirm: "Are you sure you want to deactivate your account? You will be signed out.",
    deactivated: "Your account has been deactivated.",
  },
  session: {
    title: "Session",
    description: "Sign out of your account on this device.",
  },
} as const;
