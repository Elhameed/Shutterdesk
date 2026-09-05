import { Mail, SlidersHorizontal } from "lucide-react";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";

type PreferencesCardProps = {
  preferences: ClientProfileDetail["preferences"];
};

export function PreferencesCard({ preferences }: PreferencesCardProps) {
  const copy = CLIENT_PROFILE_COPY;

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-medium text-ink-faint">
          {copy.preferences}
        </h2>
        <button
          type="button"
          className="rounded-sm p-1.5 text-ink-soft transition-colors hover:bg-paper-dim hover:text-ink"
          aria-label="Edit preferences"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-medium text-ink-faint">
            {copy.primaryContact}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink">
            <Mail className="size-3.5 text-ink-soft" aria-hidden />
            {preferences.primaryContact}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium text-ink-faint">
            {copy.artisticStyle}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(preferences.artisticStyles ?? []).map((style) => (
              <span
                key={style}
                className="rounded border border-border bg-paper-dim px-2 py-0.5 text-[10px] font-medium text-ink-soft"
              >
                {style}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-medium text-ink-faint">
            {copy.editingPrefs}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {preferences.editingPrefs}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium text-ink-faint">
            {copy.specialRequirements}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-soft">
            {preferences.specialRequirements}
          </p>
        </div>
      </div>
    </section>
  );
}
