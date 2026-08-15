import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import {
  ONBOARDING_COPY,
  ONBOARDING_TOTAL_STEPS,
  PHOTOGRAPHER_PROFILE_STEP,
} from "@/constants/onboarding";
import { ClientProfileForm } from "@/features/onboarding/components/ClientProfileForm";

export function ClientProfileView() {
  const copy = ONBOARDING_COPY.clientProfile;

  return (
    <OnboardingLayout className="max-w-4xl">
      <OnboardingProgress
        currentStep={PHOTOGRAPHER_PROFILE_STEP}
        totalSteps={ONBOARDING_TOTAL_STEPS}
        stepLabel={copy.stepLabel}
      />

      <ClientProfileForm />
    </OnboardingLayout>
  );
}
