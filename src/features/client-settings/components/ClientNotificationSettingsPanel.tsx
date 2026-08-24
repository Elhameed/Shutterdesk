import { Checkbox } from "@/components/ui/checkbox";
import {
  CLIENT_NOTIFICATION_CHANNELS,
  CLIENT_NOTIFICATION_EVENT_KEYS,
  CLIENT_SETTINGS_COPY,
  normalizeClientNotificationSettings,
} from "@/constants/client-settings";
import type {
  ClientNotificationChannel,
  ClientNotificationEventKey,
} from "@/constants/client-settings";
import type { ClientSettings } from "@/types/domains/settings";

type ClientNotificationSettingsPanelProps = {
  values: ClientSettings["notifications"];
  onChange: (
    eventKey: ClientNotificationEventKey,
    channel: ClientNotificationChannel,
    enabled: boolean,
  ) => void;
};

export function ClientNotificationSettingsPanel({
  values,
  onChange,
}: ClientNotificationSettingsPanelProps) {
  const copy = CLIENT_SETTINGS_COPY.notifications;
  const normalized = normalizeClientNotificationSettings(values);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-charcoal">{copy.title}</h3>
        <p className="mt-1 text-xs text-muted">{copy.subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left text-[10px] font-bold tracking-wider text-muted-light uppercase">
                {copy.columns.eventType}
              </th>
              {CLIENT_NOTIFICATION_CHANNELS.map((channel) => (
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
            {CLIENT_NOTIFICATION_EVENT_KEYS.map((eventKey) => {
              const event = copy.events[eventKey];

              return (
                <tr key={eventKey} className="border-b border-border last:border-0">
                  <td className="py-4 pr-4">
                    <p className="text-sm font-semibold text-charcoal">{event.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{event.description}</p>
                  </td>
                  {CLIENT_NOTIFICATION_CHANNELS.map((channel) => (
                    <td key={channel} className="py-4 text-center">
                      <Checkbox
                        checked={normalized[eventKey][channel]}
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
