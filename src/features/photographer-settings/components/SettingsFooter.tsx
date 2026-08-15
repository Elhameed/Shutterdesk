import { Button } from "@/components/ui/button";
import { SETTINGS_COPY } from "@/constants/photographer-settings";

type SettingsFooterProps = {
  saved: boolean;
  saving?: boolean;
  onReset: () => void;
  onSave: () => void;
};

export function SettingsFooter({ saved, saving = false, onReset, onSave }: SettingsFooterProps) {
  const copy = SETTINGS_COPY;

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-white px-5 py-4 sm:sticky sm:bottom-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-muted">{saved ? copy.saved : "\u00A0"}</p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onReset}>
          {copy.resetChanges}
        </Button>
        <Button variant="default" size="sm" onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : copy.saveChanges}
        </Button>
      </div>
    </div>
  );
}
