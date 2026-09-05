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
  label = "Back to website",
  className,
}: AuthBackLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "text-ink-soft hover:text-ink mb-8 inline-flex items-center gap-1.5 text-xs transition-colors",
        className,
      )}
    >
      <ArrowLeft className="size-3.5" aria-hidden />
      {label}
    </Link>
  );
}
