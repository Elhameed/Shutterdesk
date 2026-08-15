import { Link } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SETTINGS_COPY } from "@/constants/photographer-settings";
import { ROUTES } from "@/constants/routes";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import type { BookingSettings } from "@/types/domains/settings";

type BookingPreferencesPanelProps = {
  values: BookingSettings;
  onChange: <K extends keyof BookingSettings>(
    key: K,
    value: BookingSettings[K],
  ) => void;
};

export function BookingPreferencesPanel({
  values,
  onChange,
}: BookingPreferencesPanelProps) {
  const copy = SETTINGS_COPY.booking;

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="max-days-ahead">{copy.maxDaysAhead}</Label>
          <Input
            id="max-days-ahead"
            type="number"
            min={1}
            max={365}
            value={values.maxDaysAhead}
            onChange={(event) =>
              onChange("maxDaysAhead", Number(event.target.value) || 60)
            }
          />
          <p className="text-xs text-muted">{copy.maxDaysAheadHint}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slot-interval">{copy.slotInterval}</Label>
          <Input
            id="slot-interval"
            type="number"
            min={15}
            max={120}
            step={15}
            value={values.slotIntervalMinutes}
            onChange={(event) =>
              onChange("slotIntervalMinutes", Number(event.target.value) || 30)
            }
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="buffer-minutes">{copy.bufferMinutes}</Label>
          <Input
            id="buffer-minutes"
            type="number"
            min={0}
            max={120}
            value={values.bufferMinutes}
            onChange={(event) =>
              onChange("bufferMinutes", Number(event.target.value) || 0)
            }
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cancellation-policy">{copy.cancellationPolicy}</Label>
          <Textarea
            id="cancellation-policy"
            value={values.cancellationPolicy}
            placeholder={copy.cancellationPlaceholder}
            onChange={(event) => onChange("cancellationPolicy", event.target.value)}
            className="min-h-28 resize-y"
          />
        </div>
      </div>

      <Link
        to={ROUTES.photographer.calendar}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold/80"
      >
        <CalendarDays className="size-4" aria-hidden />
        {copy.calendarLink}
      </Link>
    </div>
  );
}
