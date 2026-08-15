import { cn } from "@/lib/utils";

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
};

export function OnboardingProgress({
  currentStep,
  totalSteps,
  stepLabel,
}: OnboardingProgressProps) {
  return (
    <div className="mb-10 text-center lg:mb-12">
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const isReached = step <= currentStep;

          return (
            <span
              key={step}
              className={cn(
                "h-1 w-10 rounded-full sm:w-12",
                isReached ? "bg-gold" : "bg-border",
              )}
              aria-hidden
            />
          );
        })}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {stepLabel}
      </p>
    </div>
  );
}
