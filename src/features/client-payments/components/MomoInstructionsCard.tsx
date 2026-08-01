import { Smartphone } from "lucide-react";
import { CopyableField } from "@/features/client-payments/components/CopyableField";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import type { StudioPaymentProfile } from "@/types/domains/payment";
import { cn } from "@/lib/utils";

type MomoInstructionsCardProps = {
  config: StudioPaymentProfile;
  bookingReference?: string;
  compact?: boolean;
  className?: string;
};

export function MomoInstructionsCard({
  config,
  bookingReference,
  compact = false,
  className,
}: MomoInstructionsCardProps) {
  const copy = CLIENT_PAYMENTS_COPY;

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-white p-5 shadow-card sm:p-6",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Smartphone className="size-5 text-gold" aria-hidden />
        <h2 className="text-base font-bold text-charcoal">
          {copy.momoInstructions}
        </h2>
      </div>

      <p className="mt-1 text-sm text-muted">{config.provider}</p>

      <div className={cn("mt-5 space-y-4", compact && "mt-4 space-y-3")}>
        {config.merchantCode ? (
          <CopyableField
            label={copy.merchantCode}
            value={config.merchantCode}
            copiedLabel={copy.upload.copied}
          />
        ) : null}
        <CopyableField
          label={copy.momoNumber}
          value={config.momoNumber}
          copiedLabel={copy.upload.copied}
        />
        <CopyableField
          label={copy.businessName}
          value={config.momoAccountName}
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
