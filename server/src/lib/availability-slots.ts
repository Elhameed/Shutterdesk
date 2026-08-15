import type { AvailabilityBlock, Booking, StudioSchedule } from "@prisma/client";
import {
  addMinutes,
  DEFAULT_WEEKLY_RULES,
  endOfDay,
  formatTimeLabel,
  overlaps,
  parseClockTime,
  parseDateKey,
  startOfDay,
  toDateKey,
  type WeeklyRule,
} from "./session-datetime.js";

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  label: string;
};

type BookingInterval = Pick<
  Booking,
  "id" | "sessionAt" | "sessionEndAt" | "durationMinutes" | "status"
>;

type ScheduleConfig = Pick<
  StudioSchedule,
  | "weeklyRules"
  | "slotIntervalMinutes"
  | "bufferMinutes"
  | "minNoticeHours"
  | "maxDaysAhead"
  | "maxSessionsPerDay"
>;

function readWeeklyRules(value: unknown): WeeklyRule[] {
  if (!Array.isArray(value)) {
    return DEFAULT_WEEKLY_RULES;
  }

  return value
    .map((rule): WeeklyRule | null => {
      if (!rule || typeof rule !== "object") {
        return null;
      }

      const entry = rule as Record<string, unknown>;
      const dow = typeof entry.dow === "number" ? entry.dow : null;
      if (dow === null || dow < 0 || dow > 6) {
        return null;
      }

      return {
        dow,
        enabled: entry.enabled === true,
        start: typeof entry.start === "string" ? entry.start : undefined,
        end: typeof entry.end === "string" ? entry.end : undefined,
      };
    })
    .filter((rule): rule is WeeklyRule => rule !== null);
}

function bookingInterval(
  booking: BookingInterval,
  bufferMinutes: number,
) {
  const start = booking.sessionAt;
  const end =
    booking.sessionEndAt ??
    addMinutes(start, booking.durationMinutes ?? 60);

  return {
    id: booking.id,
    start: addMinutes(start, -bufferMinutes),
    end: addMinutes(end, bufferMinutes),
  };
}

export function isDayFullyBlocked(
  day: Date,
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return blocks.some(
    (block) =>
      block.startsAt <= dayStart &&
      block.endsAt >= dayEnd,
  );
}

export function getManualBlockedDaysInMonth(
  year: number,
  monthIndex: number,
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const blocked: number[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    if (isDayFullyBlocked(date, blocks)) {
      blocked.push(day);
    }
  }

  return blocked;
}

function ruleForDay(rules: WeeklyRule[], day: Date) {
  return rules.find((rule) => rule.dow === day.getDay());
}

function countBookingsOnDay(bookings: BookingInterval[], day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);

  return bookings.filter(
    (booking) =>
      booking.status !== "cancelled" &&
      booking.sessionAt >= dayStart &&
      booking.sessionAt <= dayEnd,
  ).length;
}

function slotConflicts(
  slotStart: Date,
  slotEnd: Date,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  bufferMinutes: number,
  excludeBookingId?: string,
) {
  for (const booking of bookings) {
    if (booking.status === "cancelled" || booking.id === excludeBookingId) {
      continue;
    }

    const interval = bookingInterval(booking, bufferMinutes);
    if (overlaps(slotStart, slotEnd, interval.start, interval.end)) {
      return true;
    }
  }

  for (const block of blocks) {
    if (overlaps(slotStart, slotEnd, block.startsAt, block.endsAt)) {
      return true;
    }
  }

  return false;
}

export function generateDaySlots(
  day: Date,
  durationMinutes: number,
  schedule: ScheduleConfig,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  now = new Date(),
  excludeBookingId?: string,
) {
  const rules = readWeeklyRules(schedule.weeklyRules);
  const rule = ruleForDay(rules, day);

  if (!rule?.enabled || isDayFullyBlocked(day, blocks)) {
    return [] as AvailabilitySlot[];
  }

  if (countBookingsOnDay(bookings, day) >= schedule.maxSessionsPerDay) {
    return [] as AvailabilitySlot[];
  }

  const dayStart = startOfDay(day);
  const windowStart = parseClockTime(rule.start ?? "09:00", dayStart);
  const windowEnd = parseClockTime(rule.end ?? "17:00", dayStart);
  const minStart = addMinutes(now, schedule.minNoticeHours * 60);
  const maxEnd = addMinutes(startOfDay(now), schedule.maxDaysAhead * 24 * 60);

  const slots: AvailabilitySlot[] = [];
  let cursor = new Date(windowStart);

  while (addMinutes(cursor, durationMinutes) <= windowEnd) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, durationMinutes);

    const withinNotice = slotStart >= minStart;
    const withinHorizon = slotStart <= maxEnd;
    const available =
      withinNotice &&
      withinHorizon &&
      !slotConflicts(
        slotStart,
        slotEnd,
        bookings,
        blocks,
        schedule.bufferMinutes,
        excludeBookingId,
      );

    if (available) {
      slots.push({
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        label: formatTimeLabel(slotStart),
      });
    }

    cursor = addMinutes(cursor, schedule.slotIntervalMinutes);
  }

  return slots;
}

export function getAvailableDatesInMonth(
  year: number,
  monthIndex: number,
  durationMinutes: number,
  schedule: ScheduleConfig,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  now = new Date(),
) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const dates: string[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const slots = generateDaySlots(
      date,
      durationMinutes,
      schedule,
      bookings,
      blocks,
      now,
    );

    if (slots.length > 0) {
      dates.push(toDateKey(date));
    }
  }

  return dates;
}

export function assertSlotAvailable(
  slotStart: Date,
  durationMinutes: number,
  schedule: ScheduleConfig,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  now = new Date(),
  excludeBookingId?: string,
) {
  const slotEnd = addMinutes(slotStart, durationMinutes);
  const slots = generateDaySlots(
    slotStart,
    durationMinutes,
    schedule,
    bookings,
    blocks,
    now,
    excludeBookingId,
  );

  const match = slots.find((slot) => slot.startsAt === slotStart.toISOString());
  if (!match) {
    throw new Error("Selected time slot is no longer available");
  }

  if (slotConflicts(slotStart, slotEnd, bookings, blocks, schedule.bufferMinutes, excludeBookingId)) {
    throw new Error("Selected time slot conflicts with an existing booking");
  }
}

export function getBlockedDaysInMonth(
  year: number,
  monthIndex: number,
  schedule: ScheduleConfig,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  durationMinutes = 60,
  now = new Date(),
) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const blocked: number[] = [];

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const slots = generateDaySlots(
      date,
      durationMinutes,
      schedule,
      bookings,
      blocks,
      now,
    );

    if (slots.length === 0) {
      blocked.push(day);
    }
  }

  return blocked;
}

export function summarizeMonthAvailability(
  year: number,
  monthIndex: number,
  schedule: ScheduleConfig,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  durationMinutes = 60,
  now = new Date(),
) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let openDays = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, monthIndex, day);
    const slots = generateDaySlots(
      date,
      durationMinutes,
      schedule,
      bookings,
      blocks,
      now,
    );
    if (slots.length > 0) {
      openDays += 1;
    }
  }

  const percent =
    daysInMonth > 0 ? Math.round((openDays / daysInMonth) * 100) : 0;

  return {
    percent,
    label: percent <= 20 ? "Almost Full" : "Available",
    slotsRemaining: openDays,
    month: new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
      month: "long",
    }),
  };
}

export function slotsForDateKey(
  dateKey: string,
  durationMinutes: number,
  schedule: ScheduleConfig,
  bookings: BookingInterval[],
  blocks: Pick<AvailabilityBlock, "startsAt" | "endsAt">[],
  now = new Date(),
) {
  return generateDaySlots(
    parseDateKey(dateKey),
    durationMinutes,
    schedule,
    bookings,
    blocks,
    now,
  );
}
