import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type PortalBreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function PortalBreadcrumbs({ items, className }: PortalBreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-muted", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {!isLast && item.href && (
              <Link
                to={item.href}
                className="transition-colors hover:text-charcoal"
              >
                {item.label}
              </Link>
            )}
            {!isLast && item.onClick && !item.href && (
              <button
                type="button"
                onClick={item.onClick}
                className="transition-colors hover:text-charcoal"
              >
                {item.label}
              </button>
            )}
            {!isLast && !item.href && !item.onClick && (
              <span>{item.label}</span>
            )}
            {isLast && (
              <span className="font-medium text-charcoal">{item.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
