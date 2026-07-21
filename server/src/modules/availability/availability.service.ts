import type { Prisma } from "@prisma/client";
import type { StudioSchedule } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import {
  getAvailableDatesInMonth,
  getBlockedDaysInMonth,
  getManualBlockedDaysInMonth,
  isDayFullyBlocked,
  slotsForDateKey,
  summarizeMonthAvailability,
} from "../../lib/availability-slots.js";
import { DEFAULT_WEEKLY_RULES } from "../../lib/session-datetime.js";
import { parseDurationMinutes } from "../../lib/session-datetime.js";
import { getStudioForPhotographer } from "../../lib/studio-context.js";
import { AppError } from "../../middleware/error-handler.js";

export type ScheduleInput = {
  timezone?: string;
  weeklyRules?: unknown;
  slotIntervalMinutes?: number;
  bufferMinutes?: number;
  minNoticeHours?: number;
  maxDaysAhead?: number;
  maxSessionsPerDay?: number;
  requireApproval?: boolean;
};

export type BlockInput = {
  startsAt: string;
  endsAt: string;
  reason?: string;
};

async function loadStudioBookings(
  studioId: string,
  range?: { from: Date; to: Date },
) {
  const now = new Date();
  const from = range?.from ?? now;
  const to =
    range?.to ??
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 120, 23, 59, 59, 999);

  return prisma.booking.findMany({
    where: {
      studioId,
      status: { not: "cancelled" },
      sessionAt: { gte: from, lte: to },
    },
    select: {
      id: true,
      sessionAt: true,
      sessionEndAt: true,
      durationMinutes: true,
      status: true,
    },
  });
}

function bookingRangeForMonth(year: number, monthIndex: number, maxDaysAhead: number) {
  const from = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + maxDaysAhead);
  return { from, to: monthEnd > horizon ? horizon : monthEnd };
}

function bookingRangeForDateKey(dateKey: string, bufferDays = 1) {
  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  const from = new Date(year, month - 1, day - bufferDays, 0, 0, 0, 0);
  const to = new Date(year, month - 1, day + bufferDays, 23, 59, 59, 999);
  return { from, to };
}

async function loadStudioBlocks(studioId: string) {
  return prisma.availabilityBlock.findMany({
    where: { studioId },
    select: { id: true, startsAt: true, endsAt: true, reason: true },
    orderBy: { startsAt: "asc" },
  });
}

export async function getOrCreateStudioSchedule(studioId: string) {
  const existing = await prisma.studioSchedule.findUnique({
    where: { studioId },
  });

  if (existing) {
    return existing;
  }

  return prisma.studioSchedule.create({
    data: {
      studioId,
      weeklyRules: DEFAULT_WEEKLY_RULES,
    },
  });
}

function toApiSchedule(schedule: StudioSchedule) {
  return {
    timezone: schedule.timezone,
    weeklyRules: schedule.weeklyRules,
    slotIntervalMinutes: schedule.slotIntervalMinutes,
    bufferMinutes: schedule.bufferMinutes,
    minNoticeHours: schedule.minNoticeHours,
    maxDaysAhead: schedule.maxDaysAhead,
    maxSessionsPerDay: schedule.maxSessionsPerDay,
    requireApproval: schedule.requireApproval,
  };
}

export async function getPhotographerSchedule(photographerUserId: string) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const schedule = await getOrCreateStudioSchedule(studio.id);
  const blocks = await loadStudioBlocks(studio.id);

  return {
    schedule: toApiSchedule(schedule),
    blocks: blocks.map((block) => ({
      id: block.id,
      startsAt: block.startsAt.toISOString(),
      endsAt: block.endsAt.toISOString(),
      reason: block.reason,
    })),
  };
}

export async function updatePhotographerSchedule(
  photographerUserId: string,
  input: ScheduleInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  await getOrCreateStudioSchedule(studio.id);

  const schedule = await prisma.studioSchedule.update({
    where: { studioId: studio.id },
    data: {
      timezone: input.timezone,
      weeklyRules: input.weeklyRules as Prisma.InputJsonValue | undefined,
      slotIntervalMinutes: input.slotIntervalMinutes,
      bufferMinutes: input.bufferMinutes,
      minNoticeHours: input.minNoticeHours,
      maxDaysAhead: input.maxDaysAhead,
      maxSessionsPerDay: input.maxSessionsPerDay,
      requireApproval: input.requireApproval,
    },
  });

  return toApiSchedule(schedule);
}

export async function createPhotographerBlock(
  photographerUserId: string,
  input: BlockInput,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new AppError("Invalid block dates", 400);
  }

  if (endsAt <= startsAt) {
    throw new AppError("Block end must be after start", 400);
  }

  const block = await prisma.availabilityBlock.create({
    data: {
      studioId: studio.id,
      startsAt,
      endsAt,
      reason: input.reason?.trim() || null,
    },
  });

  return {
    id: block.id,
    startsAt: block.startsAt.toISOString(),
    endsAt: block.endsAt.toISOString(),
    reason: block.reason,
  };
}

export async function deletePhotographerBlock(
  photographerUserId: string,
  blockId: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const block = await prisma.availabilityBlock.findFirst({
    where: { id: blockId, studioId: studio.id },
  });

  if (!block) {
    throw new AppError("Availability block not found", 404);
  }

  await prisma.availabilityBlock.delete({ where: { id: blockId } });
}

export async function unblockPhotographerDay(
  photographerUserId: string,
  dateKey: string,
) {
  const studio = await getStudioForPhotographer(photographerUserId);
  const blocks = await loadStudioBlocks(studio.id);

  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  const dayDate = new Date(year, month - 1, day);

  const matching = blocks.filter((block) =>
    isDayFullyBlocked(dayDate, [block]),
  );

  if (matching.length === 0) {
    throw new AppError("No availability block found for this date", 404);
  }

  await prisma.availabilityBlock.deleteMany({
    where: { id: { in: matching.map((block) => block.id) } },
  });
}

export async function blockPhotographerDay(
  photographerUserId: string,
  dateKey: string,
  reason?: string,
) {
  const [year, month, day] = dateKey.split("-").map((part) => Number.parseInt(part, 10));
  const startsAt = new Date(year, month - 1, day, 0, 0, 0, 0);
  const endsAt = new Date(year, month - 1, day, 23, 59, 59, 999);

  return createPhotographerBlock(photographerUserId, {
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    reason,
  });
}

async function resolvePackageForAvailability(
  studioId: string,
  servicePackageId: string,
) {
  const pkg = await prisma.servicePackage.findFirst({
    where: { id: servicePackageId, studioId, isActive: true },
    select: { id: true, duration: true },
  });

  if (!pkg) {
    throw new AppError("Service package not available", 404);
  }

  return pkg;
}

async function loadAvailabilityContext(
  studioId: string,
  servicePackageId: string,
  range?: { from: Date; to: Date },
) {
  const [schedule, bookings, blocks, pkg] = await Promise.all([
    getOrCreateStudioSchedule(studioId),
    loadStudioBookings(studioId, range),
    loadStudioBlocks(studioId),
    resolvePackageForAvailability(studioId, servicePackageId),
  ]);

  return {
    schedule,
    bookings,
    blocks,
    durationMinutes: parseDurationMinutes(pkg.duration),
  };
}

export async function getClientAvailabilityDates(
  studioSlug: string,
  servicePackageId: string,
  month: number,
  year: number,
) {
  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } });
  if (!studio) {
    throw new AppError("Studio not found", 404);
  }

  const { schedule, bookings, blocks, durationMinutes } =
    await loadAvailabilityContext(
      studio.id,
      servicePackageId,
      bookingRangeForMonth(year, month - 1, 60),
    );

  return {
    availableDates: getAvailableDatesInMonth(
      year,
      month - 1,
      durationMinutes,
      schedule,
      bookings,
      blocks,
    ),
  };
}

export async function getClientAvailabilitySlots(
  studioSlug: string,
  servicePackageId: string,
  dateKey: string,
) {
  const studio = await prisma.studio.findUnique({ where: { slug: studioSlug } });
  if (!studio) {
    throw new AppError("Studio not found", 404);
  }

  const { schedule, bookings, blocks, durationMinutes } =
    await loadAvailabilityContext(
      studio.id,
      servicePackageId,
      bookingRangeForDateKey(dateKey),
    );

  return {
    slots: slotsForDateKey(
      dateKey,
      durationMinutes,
      schedule,
      bookings,
      blocks,
    ),
  };
}

export async function getCalendarAvailabilitySummary(
  studioId: string,
  month: number,
  year: number,
) {
  const schedule = await getOrCreateStudioSchedule(studioId);
  const range = bookingRangeForMonth(year, month - 1, schedule.maxDaysAhead);
  const [bookings, blocks] = await Promise.all([
    loadStudioBookings(studioId, range),
    loadStudioBlocks(studioId),
  ]);

  const blockedDays = getBlockedDaysInMonth(
    year,
    month - 1,
    schedule,
    bookings,
    blocks,
  );

  const manualBlockedDays = getManualBlockedDaysInMonth(
    year,
    month - 1,
    blocks,
  );

  const availability = summarizeMonthAvailability(
    year,
    month - 1,
    schedule,
    bookings,
    blocks,
  );

  return { blockedDays, manualBlockedDays, availability, blocks };
}

export async function assertBookingSlotAvailable(
  studioId: string,
  _servicePackageId: string | null | undefined,
  sessionAt: Date,
  durationMinutes: number,
  excludeBookingId?: string,
) {
  const schedule = await getOrCreateStudioSchedule(studioId);
  const dateKey = `${sessionAt.getFullYear()}-${String(sessionAt.getMonth() + 1).padStart(2, "0")}-${String(sessionAt.getDate()).padStart(2, "0")}`;
  const [bookings, blocks] = await Promise.all([
    loadStudioBookings(studioId, bookingRangeForDateKey(dateKey)),
    loadStudioBlocks(studioId),
  ]);

  const { assertSlotAvailable } = await import("../../lib/availability-slots.js");

  try {
    assertSlotAvailable(
      sessionAt,
      durationMinutes,
      schedule,
      bookings,
      blocks,
      new Date(),
      excludeBookingId,
    );
  } catch {
    throw new AppError("Selected time slot is no longer available", 409);
  }
}
