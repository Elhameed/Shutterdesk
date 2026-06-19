import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  label: string;
  title: string;
  className?: string;
  titleClassName?: string;
  align?: "center" | "left";
};

export function SectionHeader({
  label,
  title,
  className,
  titleClassName,
  align = "center",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        align === "center" ? "text-center" : "text-left",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        {label}
      </p>
      <h2
        className={cn(
          "mt-3 text-3xl font-bold tracking-tight text-charcoal sm:text-4xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
    </div>
  );
}
