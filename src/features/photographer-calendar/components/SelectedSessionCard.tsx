import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { landingAssets } from "@/constants/assets";
import { ROUTES } from "@/constants/routes";
import {
  BOOKING_STATUS_BADGE_STYLES,
  PAYMENT_BADGE_STYLES,
} from "@/constants/status-colors";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";
import {
  formatPeriodLabel,
  getSessionsForDate,
  isManuallyBlockedDate,
  type CalendarDate,
} from "@/features/photographer-calendar/lib/calendar-navigation";
import { getApiErrorMessage } from "@/lib/api-error";
import { resolveMediaUrl } from "@/lib/media-url";
import { photographerApi } from "@/services/photographer";
import { toDateKey } from "@/types/domains/availability";
import { cn } from "@/lib/utils";

type SelectedSessionCardProps = {
  focusDate: CalendarDate;
  onUpdated?: () => void;
};

export function SelectedSessionCard({
  focusDate,
  onUpdated,
}: SelectedSessionCardProps) {
  const copy = CALENDAR_COPY;
  const { push } = useToast();
  const { sessions, month, manualBlockedDays } = useCalendarData();
  const daySessions = getSessionsForDate(focusDate, sessions);
  const dayLabel = formatPeriodLabel(focusDate, "day");
  const isBlocked = isManuallyBlockedDate(focusDate, month, manualBlockedDays);
  const [isUnblocking, setIsUnblocking] = useState(false);

  const handleMakeAvailable = async () => {
    const dateKey = toDateKey(
      new Date(focusDate.year, focusDate.monthIndex, focusDate.day),
    );

    setIsUnblocking(true);
    try {
      await photographerApi.availability.unblockDay(dateKey);
      push({ title: copy.unblockDaySuccess, variant: "success" });
      onUpdated?.();
    } catch (error) {
      push({
        title: copy.unblockDayError,
        description: getApiErrorMessage(error),
        variant: "error",
      });
    } finally {
      setIsUnblocking(false);
    }
  };

  if (daySessions.length === 0) {
    return (
      <section className="rounded-md border border-dashed border-border bg-panel p-5 text-center">
        <h2 className="text-[11px] font-medium text-ink-faint">
          {copy.selectedSession}
        </h2>
        {isBlocked ? (
          <>
            <p className="mt-2 text-sm font-medium text-ink">
              {copy.dayBlockedLabel}
            </p>
            <p className="mt-1 text-xs text-ink-soft">{copy.dayBlockedHint}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              disabled={isUnblocking}
              onClick={() => void handleMakeAvailable()}
            >
              {copy.makeAvailable}
            </Button>
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-soft">{copy.noSessionsOnDay}</p>
        )}
        <p className="mt-2 text-xs text-ink-faint">{dayLabel}</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-[11px] font-medium text-ink-faint">
          {copy.selectedSession}
        </h2>
        <span className="text-[10px] font-medium text-ink-soft">
          {daySessions.length === 1
            ? dayLabel
            : `${daySessions.length} sessions`}
        </span>
      </div>

      {isBlocked ? (
        <div className="mb-3 rounded-sm border border-border bg-ink/5 p-3">
          <p className="text-xs font-medium text-ink">{copy.dayBlockedLabel}</p>
          <p className="mt-1 text-xs text-ink-soft">{copy.dayBlockedHint}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isUnblocking}
            onClick={() => void handleMakeAvailable()}
          >
            {copy.makeAvailable}
          </Button>
        </div>
      ) : null}

      <div className="space-y-3">
        {daySessions.map((session) => {
          const image = resolveMediaUrl(
            session.imageAssetKey,
            landingAssets.gallery.portrait[1]?.src ??
              landingAssets.gallery.portrait[0]?.src,
          );
          const statusStyle =
            session.status === "paid"
              ? PAYMENT_BADGE_STYLES.paid
              : BOOKING_STATUS_BADGE_STYLES.confirmed;
          const statusLabel =
            session.status === "paid" ? copy.paid : copy.sessionStatus.confirmed;

          return (
            <Link
              key={session.id}
              to={ROUTES.photographer.bookingDetail(session.id)}
              className="block rounded-md border border-border bg-panel p-4 transition-colors hover:border-accent/40 hover:bg-accent-tint/20"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {session.clientNames}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-soft">
                    {session.category}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    statusStyle,
                  )}
                >
                  {statusLabel}
                </span>
              </div>

              <div className="mt-3 hidden overflow-hidden rounded-sm xl:block">
                <img
                  src={image}
                  alt={`${session.clientNames} session`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>

              <dl className="mt-3 space-y-2">
                <div>
                  <dt className="text-[10px] font-medium text-ink-faint">
                    {copy.time}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink">
                    {session.time}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-medium text-ink-faint">
                    {copy.location}
                  </dt>
                  <dd className="mt-0.5 flex items-start gap-1.5 text-sm font-medium text-ink">
                    <MapPin
                      className="mt-0.5 size-3.5 shrink-0 text-ink-soft"
                      aria-hidden
                    />
                    <span className="line-clamp-2">{session.location}</span>
                  </dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
