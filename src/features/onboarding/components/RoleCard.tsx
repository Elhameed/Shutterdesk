import type { RoleOption } from "@/constants/onboarding";
import { cn } from "@/lib/utils";

type RoleCardProps = {
  role: RoleOption;
  selected: boolean;
  onSelect: () => void;
};

export function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const Icon = role.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md border bg-panel text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
        selected
          ? "border-accent opacity-100 ring-1 ring-accent hover:shadow-elevated"
          : "border-border opacity-50 hover:opacity-60",
      )}
    >
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex size-11 items-center justify-center rounded-md bg-[#f3f3f1] text-ink">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-xl font-bold text-ink">{role.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {role.description}
        </p>
      </div>

      <div className="px-6 pb-6 sm:px-7 sm:pb-7">
        {role.image ? (
          <img
            src={role.image}
            alt={role.imageAlt}
            className="aspect-[4/3] w-full rounded-md object-cover grayscale"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-paper-dim text-sm text-ink-soft">
            {role.imageAlt}
          </div>
        )}
      </div>
    </button>
  );
}
