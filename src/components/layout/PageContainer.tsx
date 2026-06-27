import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /** Max width variant for page content */
  size?: "default" | "wide" | "full";
};

const sizeClasses = {
  default: "max-w-6xl",
  wide: "max-w-[1200px]",
  full: "max-w-none",
};

export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
