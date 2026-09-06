export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatMemberSince(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * How much room the caller has.
 *
 * `long` spells the unit out and resolves to the minute — used in activity
 * feeds. `compact` abbreviates hours and treats anything under an hour as
 * "Just now" — used in the notification list and gallery activity, where the
 * timestamp sits in a tight column.
 *
 * These were two separate implementations that had drifted apart; the
 * difference is real, so it is a parameter rather than something to flatten.
 */
export type RelativeTimeStyle = "long" | "compact";

export function formatRelativeTime(
  date: Date,
  now: Date = new Date(),
  style: RelativeTimeStyle = "long",
): string {
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (style === "compact") {
    if (diffHours < 1) {
      return "Just now";
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const compactDays = Math.floor(diffHours / 24);
    if (compactDays === 1) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return formatDisplayDate(date);
}

/** Shorthand for the compact style. */
export function formatRelativeTimestamp(date: Date, now: Date = new Date()): string {
  return formatRelativeTime(date, now, "compact");
}
