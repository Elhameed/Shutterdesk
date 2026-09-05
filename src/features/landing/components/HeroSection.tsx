import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { landingAssets } from "@/constants/assets";
import { HERO_TRUST_INDICATORS } from "@/constants/landing";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES } from "@/constants/routes";
import { BrowserFrame } from "@/features/landing/components/BrowserFrame";

export function HeroSection() {
  return (
    <section className="bg-paper pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
      <PageContainer>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-ink text-4xl leading-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
            Manage your photography business
            <br />
            <span className="text-accent">From booking to delivery</span>
          </h1>
          <p className="text-ink-soft mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
            Shutterdesk helps photographers manage bookings, clients, payments,
            and photo galleries in one streamlined platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to={ROUTES.register}>Start free trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#how-it-works">View demo</a>
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {HERO_TRUST_INDICATORS.map((item) => (
              <li
                key={item}
                className="text-ink-soft flex items-center gap-2 text-sm"
              >
                <Check className="text-accent size-4 shrink-0" strokeWidth={2} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-12 max-w-5xl lg:mt-16">
          <BrowserFrame>
            <img
              src={landingAssets.hero.studioMockup}
              alt="Photography studio with camera and Shutterdesk dashboard on screen"
              className="aspect-[16/10] w-full object-cover object-top"
            />
          </BrowserFrame>
        </div>
      </PageContainer>
    </section>
  );
}
