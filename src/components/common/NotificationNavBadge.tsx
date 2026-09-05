type NotificationNavBadgeProps = {
  count: number;
};

export function NotificationNavBadge({ count }: NotificationNavBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      // Sits on the dark rail, so it needs a light chip: filled accent would
      // be near-invisible against the rail background.
      className="bg-accent-tint text-accent-fg ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-semibold"
      aria-label={`${count} unread notifications`}
    >
      {label}
    </span>
  );
}
