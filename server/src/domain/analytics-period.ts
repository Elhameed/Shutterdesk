export type AnalyticsDateRange = "7" | "30" | "90" | "year";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function parseAnalyticsDateRange(
  value: string | undefined,
): AnalyticsDateRange {
  if (value === "7" || value === "30" || value === "90" || value === "year") {
    return value;
  }
  return "30";
}

export type AnalyticsPeriod = {
  range: AnalyticsDateRange;
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function getAnalyticsPeriod(
  range: AnalyticsDateRange,
  now = new Date(),
): AnalyticsPeriod {
  const end = endOfDay(now);
  let start = startOfDay(now);

  if (range === "7") {
    start.setDate(start.getDate() - 6);
  } else if (range === "30") {
    start.setDate(start.getDate() - 29);
  } else if (range === "90") {
    start.setDate(start.getDate() - 89);
  } else {
    start = new Date(now.getFullYear(), 0, 1);
  }

  const durationMs = end.getTime() - start.getTime();
  const previousEnd = endOfDay(new Date(start.getTime() - 1));
  const previousStart = startOfDay(new Date(previousEnd.getTime() - durationMs));

  return { range, start, end, previousStart, previousEnd };
}

export type TimeBucket = {
  label: string;
  start: Date;
  end: Date;
};

export function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export function buildMonthBuckets(start: Date, end: Date): TimeBucket[] {
  const buckets: TimeBucket[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor <= end) {
    const monthStart = startOfDay(
      new Date(Math.max(cursor.getTime(), start.getTime())),
    );
    const monthEnd = endOfDay(
      new Date(
        Math.min(
          new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getTime(),
          end.getTime(),
        ),
      ),
    );

    buckets.push({
      label: MONTH_LABELS[cursor.getMonth()],
      start: monthStart,
      end: monthEnd,
    });

    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  return buckets;
}

export function buildWeekBuckets(
  start: Date,
  end: Date,
  bucketCount = 4,
): TimeBucket[] {
  const durationMs = end.getTime() - start.getTime();
  const bucketMs = durationMs / bucketCount;

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = new Date(start.getTime() + index * bucketMs);
    const bucketEnd = new Date(
      start.getTime() + (index + 1) * bucketMs - 1,
    );

    return {
      label: `W${index + 1}`,
      start: bucketStart,
      end: bucketEnd,
    };
  });
}

export function buildDayBuckets(start: Date, end: Date): TimeBucket[] {
  const buckets: TimeBucket[] = [];
  const cursor = startOfDay(start);
  const last = startOfDay(end);

  while (cursor <= last) {
    buckets.push({
      label: cursor.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      start: startOfDay(cursor),
      end: endOfDay(cursor),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return buckets;
}
