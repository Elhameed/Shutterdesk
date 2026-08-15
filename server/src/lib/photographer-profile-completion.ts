const DEFAULT_AVATAR = "app/user-avatar";

export type ProfileCompletionItem = {
  id: string;
  label: string;
  completed: boolean;
  optional?: boolean;
};

export type ProfileCompletionSummary = {
  percent: number;
  items: ProfileCompletionItem[];
};

type StudioProfileSource = {
  name: string;
  avatarAssetKey: string | null;
  paymentProfile: unknown;
  profileSettings: unknown;
  brandSettings: unknown;
};

type OwnerProfileSource = {
  fullName: string;
  avatarUrl: string | null;
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function isDefaultStudioName(name: string, ownerFullName: string) {
  return name.trim() === `${ownerFullName.trim()} Photography`;
}

function isDefaultAvatar(value: string | null | undefined) {
  if (!value?.trim()) return true;
  if (value === DEFAULT_AVATAR) return true;
  return value.includes("user-avatar");
}

function hasCustomAvatar(studio: StudioProfileSource, owner: OwnerProfileSource) {
  const profileSettings = (studio.profileSettings ?? {}) as Record<string, unknown>;
  const avatar =
    owner.avatarUrl ??
    (readString(profileSettings.avatar) || studio.avatarAssetKey);

  return !isDefaultAvatar(avatar);
}

function hasMobileMoneyConfigured(paymentProfile: Record<string, unknown>) {
  if (!readBoolean(paymentProfile.mobileMoneyEnabled)) {
    return false;
  }

  return (
    readString(paymentProfile.momoAccountName).length > 0 &&
    readString(paymentProfile.momoNumber).length > 0
  );
}

function hasBankTransferConfigured(paymentProfile: Record<string, unknown>) {
  if (!readBoolean(paymentProfile.bankTransferEnabled)) {
    return false;
  }

  return (
    readString(paymentProfile.accountName).length > 0 &&
    readString(paymentProfile.accountNumber).length > 0
  );
}

function hasPaymentMethodsConfigured(paymentProfile: Record<string, unknown>) {
  if (hasMobileMoneyConfigured(paymentProfile)) {
    return true;
  }

  if (hasBankTransferConfigured(paymentProfile)) {
    return true;
  }

  // Legacy studios created before toggles existed may only have MoMo fields saved.
  return (
    readString(paymentProfile.momoAccountName).length > 0 &&
    readString(paymentProfile.momoNumber).length > 0
  );
}

export function resolvePhotographerProfileCompletion(
  studio: StudioProfileSource,
  owner: OwnerProfileSource,
): ProfileCompletionSummary {
  const profileSettings = (studio.profileSettings ?? {}) as Record<string, unknown>;
  const brandSettings = (studio.brandSettings ?? {}) as Record<string, unknown>;
  const paymentProfile = (studio.paymentProfile ?? {}) as Record<string, unknown>;

  const specialization = readString(brandSettings.specialization);
  const bio = readString(profileSettings.bio);
  const qrCodeAssetKey = readString(paymentProfile.qrCodeAssetKey);

  const studioProfileComplete =
    !isDefaultStudioName(studio.name, owner.fullName) && specialization.length > 0;

  const items: ProfileCompletionItem[] = [
    {
      id: "studio-profile",
      label: "Studio Profile",
      completed: studioProfileComplete,
    },
    {
      id: "professional-bio",
      label: "Professional Bio",
      completed: bio.length > 0,
    },
    {
      id: "profile-photo",
      label: "Profile Photo",
      completed: hasCustomAvatar(studio, owner),
    },
    {
      id: "payment-methods",
      label: "Payment Methods",
      completed: hasPaymentMethodsConfigured(paymentProfile),
    },
    {
      id: "payment-qr",
      label: "Payment QR Code",
      completed: qrCodeAssetKey.length > 0,
      optional: true,
    },
  ];

  const requiredItems = items.filter((item) => !item.optional);
  const completedRequired = requiredItems.filter((item) => item.completed).length;

  return {
    percent: Math.round((completedRequired / requiredItems.length) * 100),
    items,
  };
}
