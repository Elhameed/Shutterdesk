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
    <div className="text-right">
      <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
        {LOCAL_TIME_COPY.localTimeLabel}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-charcoal">
        {LOCAL_TIME_COPY.city}, {formatKigaliTime(now)} {LOCAL_TIME_COPY.timezone}
      </p>
    </div>
  );
}
