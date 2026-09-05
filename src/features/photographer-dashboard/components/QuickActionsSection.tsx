import { CalendarPlus, CreditCard, Image, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { PHOTOGRAPHER_DASHBOARD_COPY } from "@/constants/photographer-dashboard";
import { FrameGrid } from "@/components/ui/card";
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
        <h2 className="font-display text-ink mb-3 text-base">{copy.title}</h2>
      )}
      <FrameGrid className="grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.id}
              to={action.to}
              className="bg-panel hover:bg-paper-dim flex items-center gap-2.5 px-3.5 py-3.5 transition-colors"
            >
              <Icon className="text-ink-faint size-4 shrink-0" aria-hidden />
              <span className="text-ink text-xs font-medium">
                {copy[action.labelKey]}
              </span>
            </Link>
          );
        })}
      </FrameGrid>
    </section>
  );
}
