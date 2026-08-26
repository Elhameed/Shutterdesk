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
    <section className="bg-white pb-16 pt-12 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
      <PageContainer>
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-charcoal sm:text-5xl lg:text-[3.25rem] lg:leading-[1.15]">
            Manage Your Photography Business
            <br />
            <span className="text-gold">From Booking to Delivery</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Shutterdesk helps photographers manage bookings, clients, payments,
            and photo galleries in one streamlined platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link to={ROUTES.register}>Start Free Trial</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#how-it-works">View Demo</a>
            </Button>
          </div>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {HERO_TRUST_INDICATORS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted"
              >
                <Check className="size-4 shrink-0 text-gold" strokeWidth={2.5} />
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
