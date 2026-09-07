import { Shield } from "lucide-react";
import type { ClientPaymentMethod } from "@/features/client-payments/lib/payment-methods";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import { cn } from "@/lib/utils";

type PaymentInstructionsCardProps = {
  method: ClientPaymentMethod;
  className?: string;
};

export function PaymentInstructionsCard({
  method,
  className,
}: PaymentInstructionsCardProps) {
  const copy = CLIENT_PAYMENTS_COPY.upload;
  const instructions =
    method === "bank_transfer" ? copy.instructionsBank : copy.instructionsMomo;

  return (
    <section
      className={cn(
        "rounded-md border border-border bg-panel p-5 sm:p-6",
        className,
      )}
    >
      <h2 className="text-base font-bold text-ink">{copy.instructionsTitle}</h2>
      <ol className="mt-4 space-y-3">
        {instructions.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-ink-soft">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-hover/15 text-xs font-bold text-accent">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex gap-3 rounded-sm bg-accent-hover/10 p-4">
        <Shield className="size-5 shrink-0 text-accent" aria-hidden />
        <p className="text-xs leading-relaxed text-ink">
          {copy.verificationNote}
        </p>
      </div>
    </section>
  );
}
