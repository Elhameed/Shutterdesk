import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PLATFORM_FEATURES } from "@/constants/landing";
import { cn } from "@/lib/utils";

export function CorePlatformSection() {
  return (
    <section id="features" className="bg-panel py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <SectionHeader
          label="Core platform"
          title="Powerful tools for modern photographers"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PLATFORM_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className={cn(
                  "border-border bg-paper rounded-md border p-6",
                  "hover:border-border-strong transition-colors",
                )}
              >
                <div className="text-ink-faint flex size-9 items-center justify-center">
                  <Icon className="size-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-ink mt-3 text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="text-ink-soft mt-2 text-sm leading-relaxed">
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
