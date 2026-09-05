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
      <p className="text-ink-faint text-xs">{label}</p>
      <h2
        className={cn(
          "font-display text-ink mt-2 text-3xl sm:text-4xl",
          titleClassName,
        )}
      >
        {title}
      </h2>
    </div>
  );
}
