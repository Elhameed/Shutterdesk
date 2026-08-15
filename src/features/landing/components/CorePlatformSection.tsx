import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PLATFORM_FEATURES } from "@/constants/landing";
import { cn } from "@/lib/utils";

export function CorePlatformSection() {
  return (
    <section id="features" className="bg-white py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <SectionHeader
          label="Core Platform"
          title="Powerful tools for modern photographers"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PLATFORM_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={cn(
                  "rounded-xl border border-border bg-white p-6",
                  "shadow-card transition-shadow hover:shadow-elevated",
                )}
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-gold-light text-gold">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-charcoal">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </section>
  );
}
