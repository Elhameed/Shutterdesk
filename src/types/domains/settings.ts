import type {
  GalleryWatermarkKey,
  NotificationChannel,
  NotificationEventKey,
} from "@/constants/photographer-settings";

export type ProfileSettings = {
  fullName: string;
  displayName: string;
  bio: string;
  email: string;
  instagram: string;
  website: string;
  avatar: string;
};

export type StudioSettings = {
  studioName: string;
  specialization: string;
  brandAccentColor: string;
  logoAssetKey?: string;
  watermarkAssetKey?: string;
};

export type BookingSettings = {
  maxDaysAhead: number;
  slotIntervalMinutes: number;
  bufferMinutes: number;
  cancellationPolicy: string;
};

export type DepositRequirement = "half" | "none";

export type PaymentSettings = {
  bankTransferEnabled: boolean;
  accountName: string;
  accountNumber: string;
  mobileMoneyEnabled: boolean;
  momoAccountName: string;
  momoNumber: string;
  merchantCode: string;
  provider: string;
  depositRequirement: DepositRequirement;
};

export type NotificationSettings = Record<
  NotificationEventKey,
  Record<NotificationChannel, boolean>
>;

export type GallerySettings = {
  allowDownloads: boolean;
  passwordProtection: boolean;
} & Record<GalleryWatermarkKey, boolean>;

export type SecuritySettings = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
};

export type BillingInvoice = {
  id: string;
  date: string;
  invoice: string;
  amount: number;
  status: "paid";
};

export type BillingSettings = {
  invoices: BillingInvoice[];
};

export type ClientNotificationSettings = Record<
  "bookingUpdates" | "paymentUpdates" | "galleryUpdates",
  Record<"email" | "sms" | "inApp", boolean>
>;

export type ClientSettings = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  interests: string[];
  avatarUrl?: string;
  notifications: ClientNotificationSettings;
};

export type ClientSecuritySettings = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type SettingsPanel =
  | "profile"
  | "studio"
  | "payment"
  | "notifications"
  | "gallery"
  | "booking"
  | "security"
  | "billing";
