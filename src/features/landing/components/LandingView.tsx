import { CorePlatformSection } from "@/features/landing/components/CorePlatformSection";
import { ExperienceSection } from "@/features/landing/components/ExperienceSection";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { PricingSection } from "@/features/landing/components/PricingSection";
import { TestimonialCtaSection } from "@/features/landing/components/TestimonialCtaSection";
import { WorkflowSection } from "@/features/landing/components/WorkflowSection";

export function LandingView() {
  return (
    <>
      <HeroSection />
      <CorePlatformSection />
      <WorkflowSection />
      <ExperienceSection />
      <PricingSection />
      <TestimonialCtaSection />
    </>
  );
}
