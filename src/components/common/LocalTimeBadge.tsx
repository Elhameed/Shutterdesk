import { useEffect, useState } from "react";
import { LOCAL_TIME_COPY } from "@/constants/local-time";

function formatKigaliTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Kigali",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function LocalTimeBadge() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-border text-ink-soft inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-xs sm:self-auto">
      <span className="text-ink-faint">{LOCAL_TIME_COPY.localTimeLabel}</span>
      <span>
        {LOCAL_TIME_COPY.city}, {formatKigaliTime(now)} {LOCAL_TIME_COPY.timezone}
      </span>
    </div>
  );
}
