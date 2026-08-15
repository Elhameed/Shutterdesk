import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PRICING_PLANS } from "@/constants/landing";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <SectionHeader label="Plans" title="Flexible pricing for your growth" />
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted">
          Pricing plans are being finalized for launch. Check back soon.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col items-center rounded-xl border bg-white p-8 text-center shadow-card",
                plan.highlighted
                  ? "border-gold ring-1 ring-gold lg:scale-[1.02]"
                  : "border-border",
              )}
            >
              <h3 className="text-lg font-bold text-charcoal">{plan.name}</h3>
              <p className="mt-6 text-2xl font-bold tracking-tight text-gold">
                {plan.status}
              </p>
              <p className="mt-4 text-sm text-muted">
                Full plan details will be available at launch.
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
