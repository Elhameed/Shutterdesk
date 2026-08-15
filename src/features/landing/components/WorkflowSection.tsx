import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { WORKFLOW_LABEL, WORKFLOW_STEPS } from "@/constants/landing";

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <SectionHeader
          label={WORKFLOW_LABEL}
          title="Streamlined from start to finish"
        />

        <div className="relative mt-14 hidden lg:block">
          <div
            className="absolute left-[10%] right-[10%] top-6 h-px bg-border"
            aria-hidden
          />
          <ol className="grid grid-cols-5 gap-6">
            {WORKFLOW_STEPS.map((step) => (
              <li key={step.step} className="text-center">
                <div className="relative z-10 mx-auto flex size-12 items-center justify-center rounded-full border-2 border-charcoal bg-white text-lg font-bold text-charcoal">
                  {step.step}
                </div>
                <h3 className="mt-5 text-sm font-bold text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <ol className="mt-10 lg:hidden">
          {WORKFLOW_STEPS.map((step, index) => {
            const isLast = index === WORKFLOW_STEPS.length - 1;

            return (
              <li key={step.step} className="flex gap-4">
                <div className="flex flex-col items-center self-stretch">
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-charcoal bg-white text-sm font-bold text-charcoal">
                    {step.step}
                  </div>
                  {!isLast ? (
                    <div
                      className="w-px flex-1 bg-border"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <div className={isLast ? "pb-0" : "pb-8"}>
                  <h3 className="font-bold text-charcoal">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </PageContainer>
    </section>
  );
}
