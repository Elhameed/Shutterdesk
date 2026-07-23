import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CALENDAR_COPY } from "@/constants/photographer-calendar";
import { useCalendarData } from "@/features/photographer-calendar/lib/calendar-data-context";
import {
  formatPeriodLabel,
  isManuallyBlockedDate,
  type CalendarDate,
} from "@/features/photographer-calendar/lib/calendar-navigation";
import { photographerApi } from "@/services/photographer";
import {
  DEFAULT_WEEKLY_RULES,
  findFullDayBlock,
  isFullDayBlock,
  toDateKey,
  type AvailabilityBlock,
  type StudioSchedule,
  type WeeklyRule,
} from "@/types/domains/availability";
import { getApiErrorMessage } from "@/lib/api-error";

type AvailabilityManageFormProps = {
  focusDate: CalendarDate | null;
  onUpdated?: () => void;
  onDismiss?: () => void;
};

export function AvailabilityManageForm({
  focusDate,
  onUpdated,
  onDismiss,
}: AvailabilityManageFormProps) {
  const copy = CALENDAR_COPY;
  const calendarData = useCalendarData();
  const { push } = useToast();
  const [schedule, setSchedule] = useState<StudioSchedule | null>(null);
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [weeklyRules, setWeeklyRules] = useState<WeeklyRule[]>(DEFAULT_WEEKLY_RULES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isUnblocking, setIsUnblocking] = useState(false);
  const [unblockingBlockId, setUnblockingBlockId] = useState<string | null>(null);

  const loadSchedule = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await photographerApi.availability.getSchedule();
      setSchedule(data.schedule);
      setBlocks(data.blocks);
      setWeeklyRules(
        Array.isArray(data.schedule.weeklyRules)
          ? (data.schedule.weeklyRules as WeeklyRule[])
          : DEFAULT_WEEKLY_RULES,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  const focusDateKey = focusDate
    ? toDateKey(new Date(focusDate.year, focusDate.monthIndex, focusDate.day))
    : null;

  const focusDateBlocked = focusDate
    ? isManuallyBlockedDate(
        focusDate,
        calendarData.month,
        calendarData.manualBlockedDays,
      ) || (focusDateKey ? Boolean(findFullDayBlock(blocks, focusDateKey)) : false)
    : false;

  const upcomingBlockedDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return blocks
      .map((block) => {
        const start = new Date(block.startsAt);
        const dateKey = toDateKey(start);
        return isFullDayBlock(block, dateKey)
          ? { block, dateKey, date: start }
          : null;
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .filter((entry) => entry.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [blocks]);

  const updateRule = (dow: number, patch: Partial<WeeklyRule>) => {
    setWeeklyRules((current) =>
      current.map((rule) => (rule.dow === dow ? { ...rule, ...patch } : rule)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await photographerApi.availability.updateSchedule({
        weeklyRules,
        slotIntervalMinutes: schedule?.slotIntervalMinutes ?? 30,
        bufferMinutes: schedule?.bufferMinutes ?? 15,
        minNoticeHours: schedule?.minNoticeHours ?? 24,
        maxDaysAhead: schedule?.maxDaysAhead ?? 60,
        maxSessionsPerDay: schedule?.maxSessionsPerDay ?? 3,
        requireApproval: schedule?.requireApproval ?? true,
      });
      setSchedule(updated);
      push({ title: copy.availabilitySaved, variant: "success" });
      onUpdated?.();
      onDismiss?.();
    } catch (error) {
      push({
        title: getApiErrorMessage(error),
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlockDay = async () => {
    if (!focusDateKey) return;

    setIsBlocking(true);
    try {
      await photographerApi.availability.blockDay(focusDateKey, "Blocked by photographer");
      await loadSchedule();
      push({ title: copy.blockDaySuccess, variant: "success" });
      onUpdated?.();
      onDismiss?.();
    } catch (error) {
      push({
        title: copy.blockDayError,
        description: getApiErrorMessage(error),
        variant: "error",
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblockDay = async (dateKey: string) => {
    setIsUnblocking(true);
    try {
      await photographerApi.availability.unblockDay(dateKey);
      await loadSchedule();
      push({ title: copy.unblockDaySuccess, variant: "success" });
      onUpdated?.();
      onDismiss?.();
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

  const handleUnblockBlock = async (blockId: string, dateKey: string) => {
    setUnblockingBlockId(blockId);
    try {
      await photographerApi.availability.unblockDay(dateKey);
      await loadSchedule();
      push({ title: copy.unblockDaySuccess, variant: "success" });
      onUpdated?.();
    } catch (error) {
      push({
        title: copy.unblockDayError,
        description: getApiErrorMessage(error),
        variant: "error",
      });
    } finally {
      setUnblockingBlockId(null);
    }
  };

  if (isLoading) {
    return (
      <div
        className="space-y-3"
        role="status"
        aria-busy
        aria-label="Loading availability"
      >
        <Skeleton className="h-3.5 w-3/4" />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <p className="text-sm text-muted">{copy.manageAvailabilityHint}</p>

      <ul className="mt-4 space-y-2">
        {weeklyRules.map((rule) => (
          <li
            key={rule.dow}
            className="rounded-lg border border-border bg-gray-50/50 p-3"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(event) =>
                  updateRule(rule.dow, { enabled: event.target.checked })
                }
              />
              {copy.shortWeekdays[rule.dow]}
            </label>

            {rule.enabled ? (
              <div className="mt-2 grid min-w-0 grid-cols-2 gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                    {copy.dayStart}
                  </span>
                  <Input
                    type="time"
                    className="mt-1 min-w-0"
                    value={rule.start ?? "09:00"}
                    onChange={(event) =>
                      updateRule(rule.dow, { start: event.target.value })
                    }
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
                    {copy.dayEnd}
                  </span>
                  <Input
                    type="time"
                    className="mt-1 min-w-0"
                    value={rule.end ?? "17:00"}
                    onChange={(event) =>
                      updateRule(rule.dow, { end: event.target.value })
                    }
                  />
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="buffer-minutes">{copy.bufferBetweenSessions}</Label>
          <Input
            id="buffer-minutes"
            type="number"
            min={0}
            max={120}
            className="mt-1"
            value={schedule?.bufferMinutes ?? 15}
            onChange={(event) =>
              setSchedule((current) =>
                current
                  ? { ...current, bufferMinutes: Number(event.target.value) }
                  : current,
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="max-sessions">{copy.maxSessionsPerDay}</Label>
          <Input
            id="max-sessions"
            type="number"
            min={1}
            max={20}
            className="mt-1"
            value={schedule?.maxSessionsPerDay ?? 3}
            onChange={(event) =>
              setSchedule((current) =>
                current
                  ? { ...current, maxSessionsPerDay: Number(event.target.value) }
                  : current,
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="min-notice">{copy.minNotice}</Label>
          <Input
            id="min-notice"
            type="number"
            min={0}
            max={168}
            className="mt-1"
            value={schedule?.minNoticeHours ?? 24}
            onChange={(event) =>
              setSchedule((current) =>
                current
                  ? { ...current, minNoticeHours: Number(event.target.value) }
                  : current,
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="max-days">{copy.maxDaysAhead}</Label>
          <Input
            id="max-days"
            type="number"
            min={1}
            max={365}
            className="mt-1"
            value={schedule?.maxDaysAhead ?? 60}
            onChange={(event) =>
              setSchedule((current) =>
                current
                  ? { ...current, maxDaysAhead: Number(event.target.value) }
                  : current,
              )
            }
          />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-[11px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.upcomingBlockedDays}
        </h3>
        {upcomingBlockedDays.length === 0 ? (
          <p className="mt-2 text-xs text-muted">{copy.noBlockedDays}</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {upcomingBlockedDays.map(({ block, dateKey, date }) => (
              <li
                key={block.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-gray-50/50 px-3 py-2"
              >
                <span className="text-sm font-medium text-charcoal">
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={unblockingBlockId === block.id}
                  onClick={() => void handleUnblockBlock(block.id, dateKey)}
                >
                  {copy.makeAvailable}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!focusDate ? (
        <p className="mt-4 text-xs text-muted">{copy.noDaySelected}</p>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-gray-50/50 p-3">
          <p className="text-xs font-medium text-charcoal">
            {formatPeriodLabel(focusDate, "day")}
          </p>
          {focusDateBlocked ? (
            <p className="mt-1 text-xs text-muted">{copy.dayBlockedHint}</p>
          ) : null}
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          onClick={() => void handleSave()}
          disabled={isSaving}
        >
          {copy.saveAvailability}
        </Button>
        {focusDateBlocked && focusDateKey ? (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => void handleUnblockDay(focusDateKey)}
            disabled={isUnblocking}
          >
            {copy.unblockSelectedDay}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => void handleBlockDay()}
            disabled={!focusDate || isBlocking}
          >
            {copy.blockSelectedDay}
          </Button>
        )}
      </div>
    </div>
  );
}
