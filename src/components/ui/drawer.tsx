import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: DrawerProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="bg-ink/40 absolute inset-0"
        aria-label="Close panel"
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          "border-border bg-panel relative z-10 flex h-full w-full max-w-md flex-col border-l",
          className,
        )}
      >
        <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-4">
          <h2
            id="drawer-title"
            className="text-ink font-display text-lg"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-faint hover:bg-paper-dim hover:text-ink flex size-8 items-center justify-center rounded-sm transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <div className="border-border border-t px-5 py-4">{footer}</div>
        )}
      </aside>
    </div>
  );
}
