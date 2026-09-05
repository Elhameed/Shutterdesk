import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="bg-ink/40 absolute inset-0"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          "border-border bg-panel relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-md border",
          className,
        )}
      >
        <div className="border-border flex items-start justify-between gap-4 border-b px-6 py-5">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="text-ink font-display text-lg"
            >
              {title}
            </h2>
            {description && (
              <p className="text-ink-soft mt-1 text-sm">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:bg-paper-dim hover:text-ink flex size-8 shrink-0 items-center justify-center rounded-sm transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-border border-t px-6 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
