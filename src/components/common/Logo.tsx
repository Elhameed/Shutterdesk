import { Link } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";
import { appAssets } from "@/constants/assets";
import { getBrandLogoRoute } from "@/lib/auth-routing";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Image height in Tailwind scale — default h-8 */
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
};

export function Logo({ className, size = "md" }: LogoProps) {
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
          className={cn("w-auto", sizeClasses[size])}
        />
      ) : (
        <span className="text-xl font-bold tracking-tight text-charcoal">
          Shutterdesk
        </span>
      )}
    </Link>
  );
}
