import {
  Calendar,
  Circle,
  DollarSign,
  Image,
  Star,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type {
  ClientTimelineEvent,
  ClientTimelineType,
} from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

const timelineIcons: Record<ClientTimelineType, LucideIcon> = {
  upcoming: Calendar,
  gallery: Image,
  payment: DollarSign,
  feedback: Star,
  onboarded: UserPlus,
};

const timelineIconStyles: Record<ClientTimelineType, string> = {
  upcoming: "bg-accent-tint text-accent",
  gallery: "bg-paper-dim text-ink",
  payment: "bg-paper-dim text-ink",
  feedback: "bg-paper-dim text-ink",
  onboarded: "bg-paper-dim text-ink",
};

const defaultTimelineIcon = Circle;
const defaultTimelineIconStyle = "bg-paper-dim text-ink";

function getTimelineIcon(type: string): LucideIcon {
  return timelineIcons[type as ClientTimelineType] ?? defaultTimelineIcon;
}

function getTimelineIconStyle(type: string): string {
  return timelineIconStyles[type as ClientTimelineType] ?? defaultTimelineIconStyle;
}

type ClientTimelineTabProps = {
  events: ClientTimelineEvent[];
};

export function ClientTimelineTab({ events }: ClientTimelineTabProps) {
  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-soft">No activity yet.</p>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const Icon = getTimelineIcon(event.type);
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute top-8 left-4 h-[calc(100%-16px)] w-px bg-border"
                aria-hidden
              />
            )}

            <span
              className={cn(
                "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                getTimelineIconStyle(event.type),
              )}
            >
              <Icon className="size-3.5" aria-hidden />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              {event.highlighted ? (
                <div className="rounded-sm bg-paper-dim p-4">
                  <p className="text-sm font-bold text-ink">{event.title}</p>
                  {event.subtitle && (
                    <p className="mt-0.5 text-xs font-semibold text-accent">
                      {event.subtitle}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink-soft">{event.date}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink">
                    {event.title}{" "}
                    {event.linkText && (
                      <span className="font-semibold text-accent underline-offset-2 hover:underline">
                        {event.linkText}
                      </span>
                    )}
                  </p>
                  {event.rating && (
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: event.rating }, (_, i) => (
                        <Star
                          key={i}
                          className="size-3.5 fill-accent text-accent"
                          aria-hidden
                        />
                      ))}
                    </div>
                  )}
                  {event.quote && (
                    <p className="mt-1 text-xs italic text-ink-soft">
                      &ldquo;{event.quote}&rdquo;
                    </p>
                  )}
                  <p className="mt-1 text-xs text-ink-soft">{event.date}</p>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
