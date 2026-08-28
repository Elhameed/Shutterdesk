import { describe, expect, it } from "vitest";
import {
  generateDaySlots,
  getAvailableDatesInMonth,
  getManualBlockedDaysInMonth,
} from "../src/lib/availability-slots.js";
import { DEFAULT_WEEKLY_RULES } from "../src/lib/session-datetime.js";

const schedule = {
  weeklyRules: DEFAULT_WEEKLY_RULES,
  slotIntervalMinutes: 30,
  bufferMinutes: 15,
  minNoticeHours: 0,
  maxDaysAhead: 90,
  maxSessionsPerDay: 2,
};

describe("generateDaySlots", () => {
  it("returns slots on enabled weekdays", () => {
    const day = new Date(2026, 5, 18, 12, 0, 0);
    const slots = generateDaySlots(day, 60, schedule, [], [], day);

    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]?.label).toMatch(/AM|PM/);
  });

  it("excludes slots that overlap existing bookings", () => {
    const day = new Date(2026, 5, 18, 12, 0, 0);
    const bookingStart = new Date(2026, 5, 18, 10, 0, 0);

    const slots = generateDaySlots(
      day,
      60,
      schedule,
      [
        {
          id: "booking-1",
          sessionAt: bookingStart,
          sessionEndAt: new Date(2026, 5, 18, 11, 0, 0),
          durationMinutes: 60,
          status: "confirmed",
        },
      ],
      [],
      day,
    );

    expect(slots.every((slot) => slot.label !== "10:00 AM")).toBe(true);
  });
});

describe("getAvailableDatesInMonth", () => {
  it("returns only dates with at least one open slot", () => {
    const dates = getAvailableDatesInMonth(
      2026,
      5,
      60,
      schedule,
      [],
      [],
      new Date(2026, 5, 1),
    );

    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("getManualBlockedDaysInMonth", () => {
  it("returns day numbers covered by full-day blocks only", () => {
    const blocked = getManualBlockedDaysInMonth(2026, 5, [
      {
        startsAt: new Date(2026, 5, 18, 0, 0, 0, 0),
        endsAt: new Date(2026, 5, 18, 23, 59, 59, 999),
      },
    ]);

    expect(blocked).toEqual([18]);
  });
});
