import { Mail, SlidersHorizontal } from "lucide-react";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import type { ClientProfileDetail } from "@/types/domains/photographer-client";

type PreferencesCardProps = {
  preferences: ClientProfileDetail["preferences"];
};

export function PreferencesCard({ preferences }: PreferencesCardProps) {
  const copy = CLIENT_PROFILE_COPY;

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
          {copy.preferences}
        </h2>
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-50 hover:text-charcoal"
          aria-label="Edit preferences"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.primaryContact}
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm font-medium text-charcoal">
            <Mail className="size-3.5 text-muted" aria-hidden />
            {preferences.primaryContact}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.artisticStyle}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(preferences.artisticStyles ?? []).map((style) => (
              <span
                key={style}
                className="rounded border border-border bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-muted"
              >
                {style}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.editingPrefs}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {preferences.editingPrefs}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.specialRequirements}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {preferences.specialRequirements}
          </p>
        </div>
      </div>
    </section>
  );
}
