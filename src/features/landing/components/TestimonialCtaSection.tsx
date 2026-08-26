import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { TESTIMONIALS } from "@/constants/landing";
import { ROUTES } from "@/constants/routes";

export function TestimonialCtaSection() {
  return (
    <section className="bg-charcoal py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.5rem]">
          Spend Less Time Managing and{" "}
          <span className="text-gold">More Time Creating</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.name}
              className="relative rounded-xl bg-charcoal-muted p-8 pl-10"
            >
              <span
                className="absolute left-0 top-8 h-16 w-1 rounded-full bg-gold"
                aria-hidden
              />
              <p className="text-sm italic leading-relaxed text-white/90">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <cite className="not-italic font-bold text-white">
                    {item.name}
                  </cite>
                  <p className="text-xs text-white/50">{item.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button variant="gold" size="lg" asChild>
            <Link to={ROUTES.register}>Get Started</Link>
          </Button>
          <Button variant="outline-light" size="lg" asChild>
            <a href="#contact">Schedule Demo</a>
          </Button>
        </div>
        <p className="mt-5 text-center text-sm text-white/40">
          No credit card required • Cancel anytime
        </p>
      </PageContainer>
    </section>
  );
}
