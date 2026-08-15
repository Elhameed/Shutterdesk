import { AtSign, Globe } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { PageContainer } from "@/components/layout/PageContainer";
import { FOOTER_LINKS } from "@/constants/landing";

const linkColumns = [
  { title: "Product", links: FOOTER_LINKS.product },
  { title: "Company", links: FOOTER_LINKS.company },
  { title: "Resources", links: FOOTER_LINKS.resources },
  { title: "Legal", links: FOOTER_LINKS.legal },
] as const;

export function PublicFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-white">
      <PageContainer className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The all-in-one management platform built specifically for
              photography studios and aesthetic entrepreneurs.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-charcoal"
                aria-label="Website"
              >
                <Globe className="size-4" />
              </a>
              <a
                href="#"
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-charcoal"
                aria-label="Social"
              >
                <AtSign className="size-4" />
              </a>
            </div>
          </div>

          {linkColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold text-charcoal">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-charcoal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted sm:flex-row">
          <p>© 2024 Shutterdesk Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-charcoal">
              System Status
            </a>
            <a href="#" className="hover:text-charcoal">
              Privacy Preference
            </a>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
