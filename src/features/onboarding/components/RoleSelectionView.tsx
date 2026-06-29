import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { Button } from "@/components/ui/button";
import {
  ONBOARDING_COPY,
  ONBOARDING_TOTAL_STEPS,
  ROLE_OPTIONS,
  ROLE_SELECTION_STEP,
} from "@/constants/onboarding";
import { ROUTES } from "@/constants/routes";
import { RoleCard } from "@/features/onboarding/components/RoleCard";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";

export function RoleSelectionView() {
  const navigate = useNavigate();
  const { updateRole } = useAuth();
  const copy = ONBOARDING_COPY.roleSelection;
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleContinue() {
    if (!selectedRole) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await updateRole(selectedRole);

      navigate(
        selectedRole === "photographer"
          ? ROUTES.onboarding.photographerProfile
          : ROUTES.onboarding.clientProfile,
      );
    } catch (continueError) {
      setError(
        continueError instanceof Error
          ? continueError.message
          : "Unable to save your role. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OnboardingLayout>
      <OnboardingProgress
        currentStep={ROLE_SELECTION_STEP}
        totalSteps={ONBOARDING_TOTAL_STEPS}
        stepLabel={copy.stepLabel}
      />

      <div className="mx-auto w-full max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-charcoal sm:text-4xl">
          {copy.title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          {copy.subtitle}
        </p>
      </div>

      <div className="mx-auto mt-10 grid w-full max-w-4xl gap-6 md:grid-cols-2">
        {ROLE_OPTIONS.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            selected={selectedRole === role.id}
            onSelect={() => setSelectedRole(role.id)}
          />
        ))}
      </div>

      <div className="mx-auto mt-10 w-full max-w-md">
        <Button
          type="button"
          size="lg"
          className={cn(
            "w-full",
            selectedRole
              ? "bg-charcoal text-white hover:bg-charcoal/90"
              : "bg-[#c8c8c8] text-white hover:bg-[#c8c8c8]",
          )}
          disabled={!selectedRole || isSubmitting}
          onClick={() => void handleContinue()}
        >
          {isSubmitting ? "Saving…" : copy.continue}
          <ArrowRight className="size-4" />
        </Button>
        {error ? (
          <p className="mt-3 text-center text-sm text-red-700">{error}</p>
        ) : null}
        <p className="mt-5 text-center text-xs text-muted-light">
          {copy.settingsNote}
        </p>
      </div>
    </OnboardingLayout>
  );
}
