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
        "flex w-full flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-card transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        selected
          ? "border-gold opacity-100 ring-1 ring-gold hover:shadow-elevated"
          : "border-border opacity-50 hover:opacity-60",
      )}
    >
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex size-11 items-center justify-center rounded-xl bg-[#f3f3f1] text-charcoal">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-xl font-bold text-charcoal">{role.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {role.description}
        </p>
      </div>

      <div className="px-6 pb-6 sm:px-7 sm:pb-7">
        {role.image ? (
          <img
            src={role.image}
            alt={role.imageAlt}
            className="aspect-[4/3] w-full rounded-xl object-cover grayscale"
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-100 text-sm text-muted">
            {role.imageAlt}
          </div>
        )}
      </div>
    </button>
  );
}
