import { apiClient } from "@/lib/api-client";
import type { PhotographerSpecialization } from "@/constants/onboarding";

export type PhotographerOnboardingPayload = {
  businessName?: string;
  specialization?: PhotographerSpecialization | "";
  bio?: string;
  momoAccountName?: string;
  momoNumber?: string;
  profilePhotoName?: string;
  profilePhotoUrl?: string;
  qrCodeName?: string;
  qrCodeUrl?: string;
};

export type PhotographerOnboardingCompletePayload = {
  businessName: string;
  specialization: PhotographerSpecialization | "";
  bio: string;
  momoAccountName: string;
  momoNumber: string;
  profilePhotoName?: string;
  profilePhotoUrl?: string;
  qrCodeName?: string;
  qrCodeUrl?: string;
};

type OnboardingStudioResponse = {
  data: {
    studio: {
      id: string;
      name: string;
      slug: string;
    };
  };
};

export const onboardingService = {
  completePhotographerProfile: (payload: PhotographerOnboardingCompletePayload) =>
    apiClient.post<OnboardingStudioResponse>(
      "/photographer/onboarding/complete",
      payload,
    ),

  skipPhotographerOnboarding: (payload: PhotographerOnboardingPayload = {}) =>
    apiClient.post<OnboardingStudioResponse>(
      "/photographer/onboarding/skip",
      payload,
    ),

  skipClientOnboarding: () =>
    apiClient.post<{ data: { skipped: boolean } }>("/client/onboarding/skip"),
};
