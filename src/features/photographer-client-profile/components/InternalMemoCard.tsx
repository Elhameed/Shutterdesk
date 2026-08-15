import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { photographerApi } from "@/services/photographer";

type InternalMemoCardProps = {
  clientId: string;
  initialNotes: string | null;
  onSaved?: (notes: string | null) => void;
};

export function InternalMemoCard({
  clientId,
  initialNotes,
  onSaved,
}: InternalMemoCardProps) {
  const copy = CLIENT_PROFILE_COPY;
  const { push } = useToast();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes ?? "");
  }, [initialNotes]);

  async function handleSave() {
    setIsSaving(true);

    try {
      const saved = await photographerApi.clients.updateNotes(clientId, notes);
      onSaved?.(saved);
      push({
        title: copy.memoSaved,
        variant: "success",
      });
    } catch {
      push({
        title: copy.memoSaveFailed,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h2 className="mb-3 text-[10px] font-bold tracking-wider text-muted-light uppercase">
        {copy.internalMemo}
      </h2>

      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={copy.memoPlaceholder}
        className="min-h-[100px] bg-gray-50"
      />

      <div className="mt-3 flex justify-end">
        <Button
          variant="default"
          size="sm"
          className="text-xs font-bold uppercase"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {copy.save}
        </Button>
      </div>
    </section>
  );
}
