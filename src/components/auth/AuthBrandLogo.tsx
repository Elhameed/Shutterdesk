import { Link } from "react-router-dom";
import { Aperture } from "lucide-react";
import { appAssets, authAssets } from "@/constants/assets";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AuthBrandLogoProps = {
  className?: string;
  variant?: "gold" | "black";
};

export function AuthBrandLogo({
  className,
  variant = "gold",
}: AuthBrandLogoProps) {
  const logo =
    variant === "black" ? appAssets.logoBlack : authAssets.logoGold;

  return (
    <Link
      to={ROUTES.home}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {logo ? (
        <img src={logo} alt="Shutterdesk" className="h-8 w-auto" />
      ) : (
        <>
          <Aperture
            className={cn(
              "size-7",
              variant === "black" ? "text-charcoal" : "text-gold",
            )}
            strokeWidth={1.75}
          />
          <span
            className={cn(
              "text-xl font-semibold tracking-tight",
              variant === "black" ? "text-charcoal" : "text-gold",
            )}
          >
            Shutterdesk
          </span>
        </>
      )}
    </Link>
  );
}
