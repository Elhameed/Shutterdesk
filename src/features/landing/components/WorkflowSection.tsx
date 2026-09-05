import { SectionHeader } from "@/components/common/SectionHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { WORKFLOW_LABEL, WORKFLOW_STEPS } from "@/constants/landing";

export function WorkflowSection() {
  return (
    <section id="how-it-works" className="bg-paper py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <SectionHeader
          label={WORKFLOW_LABEL}
          title="Streamlined from start to finish"
        />

        <div className="relative mt-14 hidden lg:block">
          <div
            className="bg-border absolute top-6 right-[10%] left-[10%] h-px"
            aria-hidden
          />
          <ol className="grid grid-cols-5 gap-6">
            {WORKFLOW_STEPS.map((step) => (
              <li key={step.step} className="text-center">
                <div className="border-border-strong bg-paper font-display text-ink relative z-10 mx-auto flex size-12 items-center justify-center rounded-full border text-lg">
                  {step.step}
                </div>
                <h3 className="text-ink mt-5 text-sm font-semibold">
                  {step.title}
                </h3>
                <p className="text-ink-soft mt-2 text-sm leading-relaxed">
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
                  <div className="border-border-strong bg-paper font-display text-ink relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border text-sm">
                    {step.step}
                  </div>
                  {!isLast ? (
                    <div className="bg-border w-px flex-1" aria-hidden />
                  ) : null}
                </div>
                <div className={isLast ? "pb-0" : "pb-8"}>
                  <h3 className="text-ink font-semibold">{step.title}</h3>
                  <p className="text-ink-soft mt-1 text-sm leading-relaxed">
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
