import { Building2 } from "lucide-react";
import { CopyableField } from "@/features/client-payments/components/CopyableField";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import type { StudioPaymentProfile } from "@/types/domains/payment";
import { cn } from "@/lib/utils";

type BankTransferInstructionsCardProps = {
  config: StudioPaymentProfile;
  bookingReference?: string;
  compact?: boolean;
  className?: string;
};

export function BankTransferInstructionsCard({
  config,
  bookingReference,
  compact = false,
  className,
}: BankTransferInstructionsCardProps) {
  const copy = CLIENT_PAYMENTS_COPY;

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-white p-5 shadow-card sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Building2 className="size-5 text-gold" aria-hidden />
        <h2 className="text-base font-bold text-charcoal">
          {copy.bankInstructions}
        </h2>
      </div>

      <p className="mt-1 text-sm text-muted">{copy.bankTransferHint}</p>

      <div className={cn("mt-5 space-y-4", compact && "mt-4 space-y-3")}>
        <CopyableField
          label={copy.bankAccountName}
          value={config.accountName}
          copiedLabel={copy.upload.copied}
        />
        <CopyableField
          label={copy.bankAccountNumber}
          value={config.accountNumber}
          copiedLabel={copy.upload.copied}
        />
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        <span className="font-semibold text-charcoal">{copy.referenceNote}:</span>{" "}
        {config.referenceHint}
        {bookingReference ? (
          <>
            {" "}
            Use{" "}
            <span className="font-semibold text-charcoal">{bookingReference}</span>.
          </>
        ) : null}
      </p>
    </section>
  );
}
