import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PRICING_PLANS } from "@/constants/landing";
import { cn } from "@/lib/utils";

export function PricingSection() {
  return (
    <section id="pricing" className="bg-panel py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <SectionHeader label="Plans" title="Flexible pricing for your growth" />
        <p className="text-ink-soft mx-auto mt-4 max-w-xl text-center text-sm">
          Pricing plans are being finalized for launch. Check back soon.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-3 lg:items-stretch">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.name}
              className={cn(
                "bg-paper relative flex flex-col items-center rounded-md border p-8 text-center",
                plan.highlighted ? "border-accent" : "border-border",
              )}
            >
              <h3 className="font-display text-ink text-lg">{plan.name}</h3>
              <p className="font-display text-accent mt-6 text-2xl">
                {plan.status}
              </p>
              <p className="text-ink-soft mt-4 text-sm">
                Full plan details will be available at launch.
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
