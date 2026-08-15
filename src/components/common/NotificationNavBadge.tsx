type NotificationNavBadgeProps = {
  count: number;
};

export function NotificationNavBadge({ count }: NotificationNavBadgeProps) {
  if (count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className="ml-auto inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1.5 text-[10px] font-bold leading-none text-white"
      aria-label={`${count} unread notifications`}
    >
      {label}
    </span>
  );
}
