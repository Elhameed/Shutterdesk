import { useEffect, useMemo, useState } from "react";
import { Building2, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { BankTransferInstructionsCard } from "@/features/client-payments/components/BankTransferInstructionsCard";
import { MomoInstructionsCard } from "@/features/client-payments/components/MomoInstructionsCard";
import { PaymentInstructionsCard } from "@/features/client-payments/components/PaymentInstructionsCard";
import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import {
  getAvailablePaymentMethods,
  getDefaultPaymentMethod,
  type ClientPaymentMethod,
} from "@/features/client-payments/utils/payment-methods";
import { clientApi } from "@/services/client";
import type { StudioPaymentProfile } from "@/types/domains/payment";
import { getApiErrorMessage } from "@/lib/api-error";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { Skeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

type PaymentMethodPanelProps = {
  studioId: string;
  bookingReference?: string;
};

const METHOD_OPTIONS: Array<{
  id: ClientPaymentMethod;
  label: string;
  icon: typeof Smartphone;
}> = [
  { id: "mobile_money", label: CLIENT_PAYMENTS_COPY.paymentMethods.mobileMoney, icon: Smartphone },
  { id: "bank_transfer", label: CLIENT_PAYMENTS_COPY.paymentMethods.bankTransfer, icon: Building2 },
];

export function PaymentMethodPanel({
  studioId,
  bookingReference,
}: PaymentMethodPanelProps) {
  const copy = CLIENT_PAYMENTS_COPY;
  const { push } = useToast();
  const [config, setConfig] = useState<StudioPaymentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);
  const [selectedMethod, setSelectedMethod] = useState<ClientPaymentMethod | null>(
    null,
  );

  useEffect(() => {
    setIsLoading(true);
    void clientApi.payments
      .getStudioPaymentProfile(studioId)
      .then((profile) => {
        setConfig(profile);
        const methods = getAvailablePaymentMethods(profile);
        setSelectedMethod(getDefaultPaymentMethod(methods));
      })
      .catch((error) => {
        setConfig(null);
        setSelectedMethod(null);
        push({
          variant: "error",
          title: "Unable to load payment methods",
          description: getApiErrorMessage(error, copy.paymentMethods.noneConfigured),
        });
      })
      .finally(() => setIsLoading(false));
  }, [studioId]);

  const availableMethods = useMemo(
    () => (config ? getAvailablePaymentMethods(config) : []),
    [config],
  );

  if (showSkeleton) {
    return (
      <div
        className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6"
        role="status"
        aria-busy
        aria-label="Loading payment methods"
      >
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-24 w-full rounded-lg" />
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  if (!config || availableMethods.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-card sm:p-6">
        <p className="text-sm text-muted">{copy.paymentMethods.noneConfigured}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availableMethods.length > 1 ? (
        <div className="rounded-xl border border-border bg-white p-4 shadow-card sm:p-5">
          <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
            {copy.paymentMethods.title}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {METHOD_OPTIONS.filter((option) =>
              availableMethods.includes(option.id),
            ).map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMethod === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedMethod(option.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors",
                    isSelected
                      ? "border-charcoal bg-gray-50 text-charcoal"
                      : "border-border text-muted hover:border-muted hover:text-charcoal",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {selectedMethod === "mobile_money" ? (
          <MomoInstructionsCard
            config={config}
            bookingReference={bookingReference}
            compact
          />
        ) : null}
        {selectedMethod === "bank_transfer" ? (
          <BankTransferInstructionsCard
            config={config}
            bookingReference={bookingReference}
            compact
          />
        ) : null}
        <PaymentInstructionsCard
          method={selectedMethod ?? "mobile_money"}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
