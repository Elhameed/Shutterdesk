export type WeeklyRule = {
  dow: number;
  enabled: boolean;
  start?: string;
  end?: string;
};

export const DEFAULT_WEEKLY_RULES: WeeklyRule[] = [
  { dow: 0, enabled: false },
  { dow: 1, enabled: true, start: "09:00", end: "17:00" },
  { dow: 2, enabled: true, start: "09:00", end: "17:00" },
  { dow: 3, enabled: true, start: "09:00", end: "17:00" },
  { dow: 4, enabled: true, start: "09:00", end: "17:00" },
  { dow: 5, enabled: true, start: "09:00", end: "17:00" },
  { dow: 6, enabled: true, start: "09:00", end: "14:00" },
];

export function parseDurationMinutes(duration: string | null | undefined) {
  switch (duration) {
    case "30min":
      return 30;
    case "1hr":
      return 60;
    case "2hr":
      return 120;
    case "4hr":
      return 240;
    case "fullday":
      return 480;
    default:
      return 60;
  }
}

export function parseTimeLabel(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return { hours: 10, minutes: 0 };
  }

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }
  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
}

export function buildSessionDateTime(dateLabel: string, timeLabel: string) {
  const base = new Date(dateLabel);
  const { hours, minutes } = parseTimeLabel(timeLabel);

  if (!Number.isNaN(base.getTime())) {
    const result = new Date(base);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  return new Date();
}

export function formatTimeLabel(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function parseClockTime(clock: string, day: Date) {
  const [hours, minutes] = clock.split(":").map((part) => Number.parseInt(part, 10));
  const result = new Date(day);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
) {
  return aStart < bEnd && bStart < aEnd;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(year, month - 1, day);
}
