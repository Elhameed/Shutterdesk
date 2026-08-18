import { CalendarPlus, CreditCard, Image, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import { ROUTES } from "@/constants/routes";

const actions = [
  {
    id: "booking",
    labelKey: "newBooking" as const,
    icon: CalendarPlus,
    to: ROUTES.photographer.bookingsNew,
  },
  {
    id: "payments",
    labelKey: "reviewPayments" as const,
    icon: CreditCard,
    to: ROUTES.photographer.payments,
  },
  {
    id: "gallery",
    labelKey: "createGallery" as const,
    icon: Image,
    to: ROUTES.photographer.galleryNew,
  },
  {
    id: "client",
    labelKey: "addClient" as const,
    icon: UserPlus,
    to: ROUTES.photographer.clients,
  },
] as const;

type QuickActionsSectionProps = {
  showHeader?: boolean;
};

export function QuickActionsSection({
  showHeader = true,
}: QuickActionsSectionProps) {
  const copy = PHOTOGRAPHER_DASHBOARD_COPY.quickActions;

  return (
    <section className="min-w-0">
      {showHeader && (
        <h2 className="mb-3 text-[11px] font-semibold tracking-wider text-muted-light uppercase">
          {copy.title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              to={action.to}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-white px-3 py-5 text-center transition-colors hover:bg-gray-50"
            >
              <Icon className="size-5 text-charcoal" aria-hidden />
              <span className="text-xs font-semibold text-charcoal">
                {copy[action.labelKey]}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
