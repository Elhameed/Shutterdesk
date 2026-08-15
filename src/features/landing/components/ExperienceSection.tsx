import { Check } from "lucide-react";
import { landingAssets } from "@/constants/assets";
import { PageContainer } from "@/components/layout/PageContainer";
import { EXCELLENCE_FEATURES } from "@/constants/landing";

const showcaseImages = [
  {
    src: landingAssets.experience.dashboardMockup,
    alt: "Shutterdesk dashboard analytics",
    className: "col-span-1 row-span-1",
  },
  {
    src: landingAssets.experience.architecturePhoto,
    alt: "Architectural photography",
    className: "col-span-1 row-span-1",
  },
  {
    src: landingAssets.experience.crmMobile,
    alt: "Professional using CRM on mobile",
    className: "col-span-2 row-span-1 sm:col-span-2",
  },
];

export function ExperienceSection() {
  return (
    <section className="bg-charcoal py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              Experience Excellence
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              A command center designed for the aesthetic professional.
            </h2>
            <ul className="mt-10 space-y-8">
              {EXCELLENCE_FEATURES.map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <span className="mt-1 flex size-5 shrink-0 items-center justify-center text-gold">
                    <Check className="size-4" strokeWidth={2.5} />
                  </span>
                  <div>
                    <h3 className="font-bold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">
                      {feature.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {showcaseImages.map((image) => (
              <div
                key={image.alt}
                className={`overflow-hidden rounded-xl ${image.className}`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="h-full min-h-[140px] w-full object-cover sm:min-h-[180px]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
