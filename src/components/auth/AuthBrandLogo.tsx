import { Link } from "react-router-dom";
import { Aperture } from "lucide-react";
import { appAssets, authAssets } from "@/constants/assets";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type AuthBrandLogoProps = {
  className?: string;
  variant?: "gold" | "black";
  /**
   * Surface the mark sits on. The artwork is dark, so `light` inverts it — the
   * split layout's left panel is a darkened photo and was rendering a black
   * logo onto it.
   */
  tone?: "dark" | "light";
};

export function AuthBrandLogo({
  className,
  variant = "gold",
  tone = "dark",
}: AuthBrandLogoProps) {
  const logo =
    variant === "black" ? appAssets.logoBlack : authAssets.logoGold;

  return (
    <Link
      to={ROUTES.home}
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      {logo ? (
        <img
          src={logo}
          alt="Shutterdesk"
          className={cn("h-8 w-auto", tone === "light" && "brightness-0 invert")}
        />
      ) : (
        <>
          <Aperture
            className={cn(
              "size-7",
              tone === "light" ? "text-rail-brand" : "text-ink",
            )}
            strokeWidth={1.75}
          />
          <span
            className={cn(
              "font-display text-xl",
              tone === "light" ? "text-rail-brand" : "text-ink",
            )}
          >
            Shutterdesk
          </span>
        </>
      )}
    </Link>
  );
}
