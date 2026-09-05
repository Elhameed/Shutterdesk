import { StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";

export function InternalNotesCard() {
  const copy = BOOKING_DETAIL_COPY;

  return (
    <section className="rounded-md border border-dashed border-border bg-paper-dim p-5">
      <div className="mb-3 flex items-center gap-2">
        <StickyNote className="size-4 text-ink-soft" aria-hidden />
        <h2 className="text-[10px] font-medium text-ink-faint">
          {copy.internalNotes}
        </h2>
      </div>

      <Textarea
        placeholder={copy.notesPlaceholder}
        className="min-h-[100px] bg-panel"
      />

      <div className="mt-3 flex justify-end">
        <Button variant="outline" size="sm" className="text-xs font-medium">
          {copy.saveNote}
        </Button>
      </div>
    </section>
  );
}
