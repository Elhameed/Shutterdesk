import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { LANDING_NAV } from "@/constants/landing";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <PageContainer className="flex h-[72px] items-center justify-between">
        <Logo />

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-charcoal"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to={ROUTES.login}
            className="text-sm font-medium text-charcoal hover:text-charcoal/80"
          >
            Login
          </Link>
          <Button asChild>
            <Link to={ROUTES.register}>Get Started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg text-charcoal lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </PageContainer>

      <div
        className={cn(
          "border-t border-border bg-white lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <PageContainer className="flex flex-col gap-4 py-4">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            <Link
              to={ROUTES.login}
              className="text-sm font-medium text-charcoal"
              onClick={() => setMobileOpen(false)}
            >
              Login
            </Link>
            <Button asChild>
              <Link to={ROUTES.register} onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </PageContainer>
      </div>
    </header>
  );
}
