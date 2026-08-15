import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AuthBackLinkProps = {
  to?: string;
  label?: string;
  className?: string;
};

export function AuthBackLink({
  to = ROUTES.home,
  label = "Back to Website",
  className,
}: AuthBackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "mb-8 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-charcoal",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      {label}
    </Link>
  );
}
