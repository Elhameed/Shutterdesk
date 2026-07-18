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
    <section className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-charcoal">{copy.timeline}</h2>
        <span className="rounded-full bg-gold-light px-3 py-1 text-[10px] font-bold tracking-wide text-gold uppercase">
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
                    step.state === "upcoming" ? "bg-border" : "bg-gold/40",
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
                      ? "text-muted-light"
                      : "text-charcoal",
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    step.state === "upcoming"
                      ? "text-muted-light"
                      : "text-muted",
                  )}
                >
                  {step.timestamp}
                </p>

                {step.note && (
                  <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5 text-xs italic text-muted">
                    &ldquo;{step.note}&rdquo;
                  </p>
                )}

                {step.attachment && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2.5">
                    <FileText className="size-4 shrink-0 text-muted" aria-hidden />
                    <span className="truncate text-xs font-medium text-charcoal">
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
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-gold text-white">
        <Check className="size-3" strokeWidth={3} aria-hidden />
      </span>
    );
  }

  if (state === "current") {
    return (
      <span className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-charcoal text-white">
        <Hourglass className="size-3" strokeWidth={2.5} aria-hidden />
      </span>
    );
  }

  return (
    <span
      className="relative z-10 size-6 shrink-0 rounded-full border-2 border-border bg-white"
      aria-hidden
    />
  );
}
