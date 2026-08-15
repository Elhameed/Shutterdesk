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
      <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
        {label}
      </p>
      <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2.5">
        <span className="min-w-0 truncate text-sm font-medium text-charcoal">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-white hover:text-charcoal"
          aria-label={`Copy ${label}`}
        >
          {copied ? (
            <Check className="size-4 text-green-600" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </button>
      </div>
      {copied ? (
        <p className="text-[10px] font-medium text-green-600">{copiedLabel}</p>
      ) : null}
    </div>
  );
}
