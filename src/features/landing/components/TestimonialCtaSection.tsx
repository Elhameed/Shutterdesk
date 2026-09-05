import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { TESTIMONIALS } from "@/constants/landing";
import { ROUTES } from "@/constants/routes";

export function TestimonialCtaSection() {
  return (
    <section className="bg-rail-bg py-16 sm:py-20 lg:py-24">
      <PageContainer>
        <h2 className="font-display text-rail-text-active mx-auto max-w-3xl text-center text-3xl leading-tight sm:text-4xl lg:text-[2.5rem]">
          Spend less time managing and{" "}
          <span className="text-rail-accent">more time creating</span>
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <blockquote
              key={item.name}
              className="relative rounded-md border border-white/10 p-8 pl-10"
            >
              <span
                className="bg-rail-accent absolute top-8 left-0 h-16 w-0.5 rounded-full"
                aria-hidden
              />
              <p className="text-rail-text-active text-sm leading-relaxed italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <cite className="text-rail-text-active font-semibold not-italic">
                    {item.name}
                  </cite>
                  <p className="text-rail-text text-xs">{item.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Button variant="on-dark" size="lg" asChild>
            <Link to={ROUTES.register}>Get started</Link>
          </Button>
          <Button variant="outline-light" size="lg" asChild>
            <a href="#contact">Schedule demo</a>
          </Button>
        </div>
        <p className="text-rail-text mt-5 text-center text-sm">
          No credit card required • Cancel anytime
        </p>
      </PageContainer>
    </section>
  );
}
