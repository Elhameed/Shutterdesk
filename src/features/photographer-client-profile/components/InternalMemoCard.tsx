import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { useUpdateClientNotes } from "@/hooks/queries/photographer-mutations";

type InternalMemoCardProps = {
  clientId: string;
  initialNotes: string | null;
};

export function InternalMemoCard({ clientId, initialNotes }: InternalMemoCardProps) {
  const copy = CLIENT_PROFILE_COPY;
  const { push } = useToast();
  const [notes, setNotes] = useState(initialNotes ?? "");
  // Saving invalidates the client profile, so the parent re-reads it rather
  // than being handed the new value through a callback.
  const updateNotes = useUpdateClientNotes();

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  async function handleSave() {
    try {
      await updateNotes.mutateAsync({ id: clientId, notes });
      push({ title: copy.memoSaved, variant: "success" });
    } catch {
      push({ title: copy.memoSaveFailed, variant: "error" });
    }
  }

  return (
    <section className="rounded-md border border-border bg-panel p-5">
      <h2 className="mb-3 text-[10px] font-medium text-ink-faint">
        {copy.internalMemo}
      </h2>

      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={copy.memoPlaceholder}
        className="min-h-[100px] bg-paper-dim"
      />

      <div className="mt-3 flex justify-end">
        <Button
          variant="default"
          size="sm"
          className="text-xs font-medium"
          disabled={updateNotes.isPending}
          onClick={() => void handleSave()}
        >
          {copy.save}
        </Button>
      </div>
    </section>
  );
}
