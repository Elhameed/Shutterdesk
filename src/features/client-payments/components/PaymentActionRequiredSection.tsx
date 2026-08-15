import { CLIENT_PAYMENTS_COPY } from "@/constants/client-payments";
import type { PaymentRequest } from "@/types/domains/booking";
import { PaymentActionRequiredCard } from "@/features/client-payments/components/PaymentActionRequiredCard";

type PaymentActionRequiredSectionProps = {
  requests: PaymentRequest[];
};

export function PaymentActionRequiredSection({
  requests,
}: PaymentActionRequiredSectionProps) {
  const copy = CLIENT_PAYMENTS_COPY;
  const unpaid = requests.filter((item) => item.status === "unpaid");

  if (unpaid.length === 0) {
    return (
      <section className="rounded-xl border border-border bg-white p-6 text-center shadow-card">
        <p className="text-sm text-muted">{copy.noActionRequired}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-charcoal">{copy.actionRequired}</h2>
        <p className="mt-1 text-sm text-muted">
          {copy.actionRequiredSubtitle(unpaid.length)}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {unpaid.map((request) => (
          <PaymentActionRequiredCard key={request.id} request={request} />
        ))}
      </div>
    </section>
  );
}
