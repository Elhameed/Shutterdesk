import { Check, FileText, Hourglass } from "lucide-react";
import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";
import type {
  BookingDetail,
  TimelineStep,
} from "@/types/domains/booking";
import { cn } from "@/lib/utils";

type ClientBookingTimelineCardProps = {
  timeline: TimelineStep[];
  status: BookingDetail["detailStatus"];
};

export function ClientBookingTimelineCard({
  timeline,
  status,
}: ClientBookingTimelineCardProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;
  const statusLabel = copy.status[status];

  return (
    <section className="rounded-md border border-border bg-panel p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-ink">{copy.timeline}</h2>
        <span className="rounded-full bg-accent-tint px-3 py-1 text-[10px] font-medium text-accent">
          {statusLabel}
        </span>
      </div>

      <ol className="space-y-0">
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1;

          return (
            <li key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
              {!isLast && (
                <span
                  className={cn(
                    "absolute top-5 left-[11px] h-[calc(100%-20px)] w-px",
                    step.state === "upcoming" ? "bg-border" : "bg-accent-hover/40",
                  )}
                  aria-hidden
                />
              )}

              <TimelineIcon state={step.state} />

              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    step.state === "upcoming"
                      ? "text-ink-faint"
                      : "text-ink",
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    step.state === "upcoming"
                      ? "text-ink-faint"
                      : "text-ink-soft",
                  )}
                >
                  {step.timestamp}
                </p>

                {step.note && (
                  <p className="mt-3 rounded-sm bg-paper-dim px-3 py-2.5 text-xs italic text-ink-soft">
                    &ldquo;{step.note}&rdquo;
                  </p>
                )}

                {step.attachment && (
                  <div className="mt-3 flex items-center gap-2 rounded-sm border border-border bg-panel px-3 py-2.5">
                    <FileText className="size-4 shrink-0 text-ink-soft" aria-hidden />
                    <span className="truncate text-xs font-medium text-ink">
                      {step.attachment}
                    </span>
                  </div>
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
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
        <Check className="size-3" strokeWidth={3} aria-hidden />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-panel">
        <Hourglass className="size-3" strokeWidth={2.5} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className="relative z-10 size-6 shrink-0 rounded-full border-2 border-border bg-panel"
      aria-hidden
    />
  );
}
