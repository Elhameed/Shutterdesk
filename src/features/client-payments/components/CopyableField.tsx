import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type CopyableFieldProps = {
  label: string;
  value: string;
  copiedLabel?: string;
  className?: string;
};

export function CopyableField({
  label,
  value,
  copiedLabel = "Copied",
  className,
}: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <p className="text-[10px] font-medium text-ink-faint">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2 rounded-sm border border-border bg-paper-dim px-3 py-2.5">
        <span className="min-w-0 truncate text-sm font-medium text-ink">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-panel hover:text-ink"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="size-4 text-ok-fg" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {copied ? (
        <p className="text-[10px] font-medium text-ok-fg">{copiedLabel}</p>
      ) : null}
    </div>
  );
}
