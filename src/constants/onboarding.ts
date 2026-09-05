import { Camera, User, type LucideIcon } from "lucide-react";
import { onboardingAssets } from "@/constants/assets";
import type { UserRole } from "@/types";

export const PHOTOGRAPHER_SPECIALIZATIONS = [
  "Wedding",
  "Portrait",
  "Commercial",
  "Graduation",
  "Event",
] as const;

export type PhotographerSpecialization =
  (typeof PHOTOGRAPHER_SPECIALIZATIONS)[number];

export const ONBOARDING_COPY = {
  shared: {
    skipForNow: "Skip for now",
  },
  roleSelection: {
    stepLabel: "Step 02 • Account Type",
    title: "How will you use Shutterdesk?",
    subtitle:
      "Select the profile that best reflects your journey with us. This helps us tailor your workspace.",
    continue: "Continue",
    settingsNote: "Preference can be updated later in settings",
  },
  photographerProfile: {
    stepLabel: "Step 03 • Profile",
    title: "Set up your photography profile",
    subtitle:
      "Professional details help you attract the right clients and automate your studio operations.",
    profilePhoto: "Profile photo",
    uploadImage: "Upload image",
    profilePhotoHint: "Min 400×400px, JPG or PNG.",
    paymentQrCode: "Payment QR code",
    uploadQr: "Upload QR",
    businessName: "Business name",
    businessNamePlaceholder: "e.g. Golden Hour Studio Kigali",
    specialization: "Photography specialization",
    specializationPlaceholder: "Select specialization...",
    bio: "Bio",
    bioPlaceholder:
      "Tell your clients about your artistic vision and experience...",
    paymentDetails: "Payment details",
    momoNamePlaceholder: "MTN MoMo Account Name",
    momoNumberPlaceholder: "MoMo Number (e.g. 078X XXX XXX)",
    securityNote: "Your data is secured and encrypted",
    completeSetup: "Complete setup",
  },
  clientProfile: {
    stepLabel: "Step 03 • Profile",
    title: "Complete your profile",
    subtitle:
      "Add a few details so photographers can serve you better and deliver your galleries seamlessly.",
    profilePhoto: "Profile photo",
    profilePhotoHint: "Recommended: square JPG or PNG, max 5MB",
    phoneNumber: "Phone number",
    phonePlaceholder: "+250 788 000 000",
    phoneFromAccount: "Pre-filled from your account. You can update it here if needed.",
    address: "Location",
    addressPlaceholder: "e.g. Kigali, Rwanda",
    interests: "Photography interests",
    completeSetup: "Complete setup",
    termsPrefix: "By completing setup, you agree to our",
    termsOfService: "Terms of Service",
    termsAnd: "and",
    privacyPolicy: "Privacy Policy",
  },
} as const;

export const CLIENT_INTERESTS = [
  "Wedding",
  "Editorial",
  "Commercial",
  "Portrait",
  "Fashion",
  "Product",
  "Architecture",
] as const;

export type ClientInterest = (typeof CLIENT_INTERESTS)[number];

export type RoleOption = {
  id: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
};

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "photographer",
    title: "Photographer",
    description:
      "Professional tools to manage bookings, clients, payments, and high-end galleries.",
    icon: Camera,
    image: onboardingAssets.rolePhotographerPreview,
    imageAlt: "Professional camera on tripod",
  },
  {
    id: "client",
    title: "Client",
    description:
      "Seamlessly book sessions, view private galleries, and download your favorite moments.",
    icon: User,
    image: onboardingAssets.roleClientPreview,
    imageAlt: "Tablet displaying a photo gallery",
  },
];

export const ROLE_SELECTION_STEP = 2;
export const PHOTOGRAPHER_PROFILE_STEP = 3;
export const ONBOARDING_TOTAL_STEPS = 3;
