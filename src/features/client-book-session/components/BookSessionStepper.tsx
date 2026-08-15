import { cn } from "@/lib/utils";
import { CLIENT_BOOK_SESSION_COPY } from "@/constants/client-book-session";

type BookSessionStep = keyof typeof CLIENT_BOOK_SESSION_COPY.steps;

type BookSessionStepperProps = {
  current: BookSessionStep;
};

const STEP_ORDER: BookSessionStep[] = ["package", "schedule", "details"];

export function BookSessionStepper({ current }: BookSessionStepperProps) {
  const copy = CLIENT_BOOK_SESSION_COPY.steps;
  const currentIndex = STEP_ORDER.indexOf(current);

  return (
    <nav aria-label="Booking progress" className="mb-6">
      <ol className="flex items-start">
        {STEP_ORDER.map((step, index) => {
          const isActive = step === current;
          const isComplete = index < currentIndex;

          return (
            <li
              key={step}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center",
                index < STEP_ORDER.length - 1 && "relative",
              )}
            >
              {index < STEP_ORDER.length - 1 ? (
                <span
                  className={cn(
                    "absolute top-4 left-[calc(50%+1rem)] h-0.5 w-[calc(100%-2rem)]",
                    index < currentIndex ? "bg-gold" : "bg-border",
                  )}
                  aria-hidden
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-full text-xs font-bold",
                  isActive || isComplete
                    ? "bg-gold text-white"
                    : "bg-gray-100 text-muted",
                )}
              >
                {index + 1}
              </span>

              <span
                className={cn(
                  "mt-2 text-center text-[10px] font-bold tracking-wider uppercase",
                  isActive ? "text-charcoal" : "text-muted-light",
                )}
              >
                {copy[step]}
              </span>

              {isActive ? (
                <span className="mt-1 h-0.5 w-12 rounded-full bg-gold" aria-hidden />
              ) : (
                <span className="mt-1 h-0.5 w-12" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
