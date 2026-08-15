export type WeeklyRule = {
  dow: number;
  enabled: boolean;
  start?: string;
  end?: string;
};

export type StudioSchedule = {
  timezone: string;
  weeklyRules: WeeklyRule[];
  slotIntervalMinutes: number;
  bufferMinutes: number;
  minNoticeHours: number;
  maxDaysAhead: number;
  maxSessionsPerDay: number;
  requireApproval: boolean;
};

export type AvailabilityBlock = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export type AvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  label: string;
};

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DEFAULT_WEEKLY_RULES: WeeklyRule[] = [
  { dow: 0, enabled: false },
  { dow: 1, enabled: true, start: "09:00", end: "17:00" },
  { dow: 2, enabled: true, start: "09:00", end: "17:00" },
  { dow: 3, enabled: true, start: "09:00", end: "17:00" },
  { dow: 4, enabled: true, start: "09:00", end: "17:00" },
  { dow: 5, enabled: true, start: "09:00", end: "17:00" },
  { dow: 6, enabled: true, start: "09:00", end: "14:00" },
];

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isFullDayBlock(
  block: AvailabilityBlock,
  dateKey: string,
): boolean {
  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);
  const startsAt = new Date(block.startsAt);
  const endsAt = new Date(block.endsAt);

  return startsAt <= dayStart && endsAt >= dayEnd;
}

export function findFullDayBlock(
  blocks: AvailabilityBlock[],
  dateKey: string,
): AvailabilityBlock | undefined {
  return blocks.find((block) => isFullDayBlock(block, dateKey));
}
