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
    <header className="border-border bg-paper sticky top-0 z-50 border-b">
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
              className="text-ink-soft hover:text-ink text-sm font-medium transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to={ROUTES.login}
            className="text-ink hover:text-accent text-sm font-medium transition-colors"
          >
            Log in
          </Link>
          <Button asChild>
            <Link to={ROUTES.register}>Get started</Link>
          </Button>
        </div>

        <button
          type="button"
          className="text-ink inline-flex size-10 items-center justify-center rounded-sm lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </PageContainer>

      <div
        className={cn(
          "border-border bg-paper border-t lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <PageContainer className="flex flex-col gap-4 py-4">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-ink-soft text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="border-border flex flex-col gap-3 border-t pt-4">
            <Link
              to={ROUTES.login}
              className="text-ink text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Button asChild>
              <Link to={ROUTES.register} onClick={() => setMobileOpen(false)}>
                Get started
              </Link>
            </Button>
          </div>
        </PageContainer>
      </div>
    </header>
  );
}
