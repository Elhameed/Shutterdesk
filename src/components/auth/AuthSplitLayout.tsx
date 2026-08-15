import type { ReactNode } from "react";
import { AuthBrandLogo } from "@/components/auth/AuthBrandLogo";
import { cn } from "@/lib/utils";

type AuthSplitLayoutProps = {
  backgroundImage: string;
  headline: string;
  subheadline: string;
  children: ReactNode;
  className?: string;
  formClassName?: string;
  /** Apply grayscale filter to the left-panel background image */
  monotone?: boolean;
  logoVariant?: "gold" | "black";
};

export function AuthSplitLayout({
  backgroundImage,
  headline,
  subheadline,
  children,
  className,
  formClassName = "max-w-md",
  monotone = false,
  logoVariant = "gold",
}: AuthSplitLayoutProps) {
  return (
    <div className={cn("flex min-h-screen", className)}>
      {/* Left panel — branding */}
      <aside className="relative hidden w-1/2 lg:block">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt=""
            className={cn(
              "absolute inset-0 size-full object-cover",
              monotone && "grayscale",
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-charcoal" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
          <AuthBrandLogo variant={logoVariant} />
          <div className="max-w-md">
            <h2 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
              {headline}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/70 xl:text-base">
              {subheadline}
            </p>
          </div>
        </div>
      </aside>

      {/* Right panel — form */}
      <main className="flex w-full flex-1 flex-col lg:w-1/2">
        <div className="flex items-center border-b border-border p-6 lg:hidden">
          <AuthBrandLogo variant={logoVariant} />
        </div>
        <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-10 sm:px-10">
          <div className={cn("w-full", formClassName)}>{children}</div>
        </div>
      </main>
    </div>
  );
}
