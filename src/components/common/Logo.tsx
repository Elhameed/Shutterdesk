import { Link } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";
import { appAssets } from "@/constants/assets";
import { getBrandLogoRoute } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Image height in Tailwind scale — default h-8 */
  size?: "sm" | "md" | "lg";
  /**
   * Surface the logo sits on. Both logo assets are black-on-transparent, so
   * there is no light artwork to swap to — `light` inverts the mark to white
   * for the dark rail. Replace with a real light asset if one is ever added.
   */
  tone?: "dark" | "light";
};

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
};

export function Logo({ className, size = "md", tone = "dark" }: LogoProps) {
  const { user } = useAuth();

  return (
    <Link
      to={getBrandLogoRoute(user)}
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {appAssets.logoBlack ? (
        <img
          src={appAssets.logoBlack}
          alt="Shutterdesk"
          className={cn(
            "w-auto",
            sizeClasses[size],
            tone === "light" && "brightness-0 invert",
          )}
        />
      ) : (
        <span
          className={cn(
            "font-display text-xl",
            tone === "light" ? "text-rail-brand" : "text-ink",
          )}
        >
          Shutterdesk
        </span>
      )}
    </Link>
  );
}
