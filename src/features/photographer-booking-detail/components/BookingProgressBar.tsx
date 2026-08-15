import {
  Calendar,
  Camera,
  Check,
  CloudUpload,
  Home,
  Hourglass,
  type LucideIcon,
} from "lucide-react";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { cn } from "@/lib/utils";

const STEP_KEYS = [
  "bookingRequested",
  "paymentSubmitted",
  "paymentVerified",
  "sessionScheduled",
  "sessionCompleted",
  "galleryUploaded",
  "galleryDelivered",
] as const;

type StepKey = (typeof STEP_KEYS)[number];

const STEP_ICONS: Record<StepKey, LucideIcon> = {
  bookingRequested: Check,
  paymentSubmitted: Check,
  paymentVerified: Hourglass,
  sessionScheduled: Calendar,
  sessionCompleted: Camera,
  galleryUploaded: CloudUpload,
  galleryDelivered: Home,
};

type BookingProgressBarProps = {
  currentStep: number;
};

type StepState = "completed" | "current" | "upcoming";

function getStepState(index: number, currentStep: number): StepState {
  const finalIndex = STEP_KEYS.length - 1;

  if (currentStep >= finalIndex && index === finalIndex) {
    return "completed";
  }

  if (index < currentStep) return "completed";
  if (index === currentStep) return "current";
  return "upcoming";
}

export function BookingProgressBar({ currentStep }: BookingProgressBarProps) {
  const copy = BOOKING_DETAIL_COPY;
  const finalIndex = STEP_KEYS.length - 1;
  const progressPercent =
    currentStep >= finalIndex
      ? 100
      : STEP_KEYS.length > 1
        ? (currentStep / finalIndex) * 100
        : 0;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
      <div className="overflow-x-auto pb-1">
        <div className="relative min-w-[640px] px-2 sm:min-w-0">
          <div
            className="absolute top-4 right-8 left-8 h-0.5 bg-gray-200"
            aria-hidden
          />
          <div
            className="absolute top-4 left-8 h-0.5 bg-gold transition-all"
            style={{ width: `calc((100% - 4rem) * ${progressPercent / 100})` }}
            aria-hidden
          />

          <ol className="relative flex justify-between gap-1">
            {STEP_KEYS.map((key, index) => {
              const state = getStepState(index, currentStep);
              const Icon = STEP_ICONS[key];
              const label = copy.progressSteps[key];

              return (
                <li
                  key={key}
                  className="flex w-0 flex-1 flex-col items-center text-center"
                >
                  <span
                    className={cn(
                      "relative z-10 flex size-8 items-center justify-center rounded-full",
                      state === "completed" && "bg-gold text-white",
                      state === "current" && "bg-charcoal text-white",
                      state === "upcoming" && "bg-gray-100 text-muted-light",
                    )}
                  >
                    {state === "completed" ? (
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    ) : (
                      <Icon className="size-3.5" aria-hidden />
                    )}
                  </span>
                  <span
                    className={cn(
                      "mt-2 max-w-[5.5rem] text-[9px] leading-tight font-semibold tracking-wide uppercase sm:max-w-none sm:text-[10px]",
                      state === "upcoming"
                        ? "text-muted-light"
                        : "text-charcoal",
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
