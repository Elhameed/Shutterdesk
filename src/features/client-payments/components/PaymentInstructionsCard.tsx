import { Shield } from "lucide-react";
import type { ClientPaymentMethod } from "@/features/client-payments/utils/payment-methods";
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
        "rounded-xl border border-border bg-white p-5 shadow-card sm:p-6",
        className,
      )}
    >
      <h2 className="text-base font-bold text-charcoal">{copy.instructionsTitle}</h2>
      <ol className="mt-4 space-y-3">
        {instructions.map((step, index) => (
          <li key={step} className="flex gap-3 text-sm text-muted">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex gap-3 rounded-lg bg-gold/10 p-4">
        <Shield className="size-5 shrink-0 text-gold" aria-hidden />
        <p className="text-xs leading-relaxed text-charcoal">
          {copy.verificationNote}
        </p>
      </div>
    </section>
  );
}
