import { Checkbox } from "@/components/ui/checkbox";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_EVENT_KEYS,
  SETTINGS_COPY,
} from "@/constants/photographer-settings";
import { SettingsPanelHeader } from "@/features/photographer-settings/components/SettingsPanelHeader";
import type {
  NotificationChannel,
  NotificationEventKey,
} from "@/constants/photographer-settings";
import type { NotificationSettings } from "@/types/domains/settings";

type NotificationSettingsPanelProps = {
  values: NotificationSettings;
  onChange: (
    eventKey: NotificationEventKey,
    channel: NotificationChannel,
    enabled: boolean,
  ) => void;
};

export function NotificationSettingsPanel({
  values,
  onChange,
}: NotificationSettingsPanelProps) {
  const copy = SETTINGS_COPY.notifications;

  return (
    <div className="space-y-8 p-5 sm:p-6 lg:p-8">
      <SettingsPanelHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-[10px] font-bold tracking-wider text-muted-light uppercase">
                {copy.columns.eventType}
              </th>
              {NOTIFICATION_CHANNELS.map((channel) => (
                <th
                  key={channel}
                  className="pb-3 text-center text-[10px] font-bold tracking-wider text-muted-light uppercase"
                >
                  {copy.columns[channel]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {NOTIFICATION_EVENT_KEYS.map((eventKey) => {
              const event = copy.events[eventKey];

              return (
                <tr key={eventKey} className="border-b border-border last:border-0">
                  <td className="py-5 pr-4">
                    <p className="text-sm font-semibold text-charcoal">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {event.description}
                    </p>
                  </td>
                  {NOTIFICATION_CHANNELS.map((channel) => (
                    <td key={channel} className="py-5 text-center">
                      <Checkbox
                        checked={values[eventKey][channel]}
                        onChange={(event) =>
                          onChange(eventKey, channel, event.target.checked)
                        }
                        aria-label={`${event.title} — ${copy.columns[channel]}`}
                        className="mx-auto size-[18px] rounded-sm accent-charcoal"
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
