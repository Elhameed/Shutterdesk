import { Check, Hourglass } from "lucide-react";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import type { TimelineStep } from "@/types/domains/booking";
import { cn } from "@/lib/utils";

type BookingTimelineCardProps = {
  timeline: TimelineStep[];
};

export function BookingTimelineCard({ timeline }: BookingTimelineCardProps) {
  const copy = BOOKING_DETAIL_COPY;

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="mb-4 text-sm font-bold text-ink">
        {copy.bookingTimeline}
      </h2>

      <ol className="space-y-0">
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1;

          return (
            <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute top-[19px] left-[8px] h-[calc(100%-19px)] w-px",
                    step.state === "upcoming" ? "bg-border" : "bg-accent/40",
                  )}
                  aria-hidden
                />
              )}

              <TimelineIcon state={step.state} />

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-semibold leading-5",
                    step.state === "upcoming" ? "text-ink-faint" : "text-ink",
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs leading-4",
                    step.state === "upcoming" ? "text-ink-faint" : "text-ink-soft",
                  )}
                >
                  {step.timestamp}
                </p>
                {step.note && (
                  <p className="mt-2 rounded-sm bg-paper-dim px-3 py-2 text-xs italic text-ink-soft">
                    &ldquo;{step.note}&rdquo;
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function TimelineIcon({ state }: { state: TimelineStep["state"] }) {
  if (state === "completed") {
    return (
      <div className="relative z-10 flex h-[2.375rem] w-[18px] shrink-0 items-center justify-center">
        <span className="flex size-[18px] items-center justify-center rounded-full bg-ink text-panel">
          <Check className="size-2.5" strokeWidth={3} aria-hidden />
        </span>
      </div>
    );
  }

  if (state === "current") {
    return (
      <div className="relative z-10 flex h-[2.375rem] w-[18px] shrink-0 items-center justify-center">
        <span className="flex size-[18px] items-center justify-center rounded-full bg-accent text-on-accent">
          <Hourglass className="size-2.5" strokeWidth={3} aria-hidden />
        </span>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex h-[2.375rem] w-[18px] shrink-0 items-center justify-center">
      <span
        className="size-[18px] rounded-full border-2 border-border bg-panel"
        aria-hidden
      />
    </div>
  );
}
