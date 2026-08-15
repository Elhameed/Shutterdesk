import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CLIENT_SETTINGS_COPY } from "@/constants/client-settings";
import { ClientSettingsView } from "@/features/client-settings/components/ClientSettingsView";

type ClientSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ClientSettingsModal({ open, onClose }: ClientSettingsModalProps) {
  const copy = CLIENT_SETTINGS_COPY;
  const [isDirty, setIsDirty] = useState(false);

  function requestClose() {
    if (isDirty && !window.confirm("You have unsaved changes. Close without saving?")) {
      return;
    }
    setIsDirty(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={requestClose}
      title={copy.title}
      description={copy.subtitle}
      className="max-w-2xl"
    >
      {open ? (
        <ClientSettingsView onClose={requestClose} onDirtyChange={setIsDirty} />
      ) : null}
    </Modal>
  );
}
