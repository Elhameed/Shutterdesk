import { Check } from "lucide-react";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { formatRwf } from "@/lib/currency";
import { cn } from "@/lib/utils";

export type PaymentOption = "deposit" | "full";

type PaymentOptionSelectorProps = {
  value: PaymentOption;
  onChange: (option: PaymentOption) => void;
  depositAmount: number;
  fullAmount: number;
  depositLabel: string;
  depositHint: string;
};

export function PaymentOptionSelector({
  value,
  onChange,
  depositAmount,
  fullAmount,
  depositLabel,
  depositHint,
}: PaymentOptionSelectorProps) {
  const copy = CLIENT_PAYMENTS_COPY.upload;
  const options = [
    {
      key: "deposit" as const,
      label: depositLabel,
      hint: depositHint,
      amount: depositAmount,
    },
    {
      key: "full" as const,
      label: copy.payFull,
      hint: copy.fullHint,
      amount: fullAmount,
    },
  ];

  return (
    <section className="mt-6 rounded-md border border-border bg-panel p-5 sm:p-6">
      <p className="text-[11px] font-medium text-ink-faint">
        {copy.paymentOptionTitle}
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onChange(option.key)}
              aria-pressed={selected}
              className={cn(
                "flex flex-col rounded-sm border p-4 text-left transition-colors",
                selected
                  ? "border-accent bg-accent-tint/40 ring-1 ring-accent"
                  : "border-border bg-paper-dim hover:border-accent/40",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-ink">
                  {option.label}
                </span>
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border",
                    selected
                      ? "border-accent bg-accent text-on-accent"
                      : "border-border bg-panel",
                  )}
                >
                  {selected ? <Check className="size-3.5" aria-hidden /> : null}
                </span>
              </div>
              <span className="mt-2 text-lg font-bold tracking-tight text-ink">
                {formatRwf(option.amount)}
              </span>
              <span className="mt-1 text-xs text-ink-soft">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
