import type { ReactNode } from "react";
import { Logo } from "@/components/common/Logo";
import { cn } from "@/lib/utils";

type OnboardingLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function OnboardingLayout({ children, className }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 sm:px-8 lg:py-14",
          className,
        )}
      >
        <div className="mb-10 flex justify-center lg:mb-12">
          <Logo size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
