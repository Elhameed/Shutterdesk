import { useNavigate } from "react-router-dom";
import { Banknote, Calendar, Share2 } from "lucide-react";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { ROUTES } from "@/constants/routes";
import { clientGalleryRoute } from "@/features/photographer-clients/lib/client-gallery-navigation";
import { usePhotographerGalleries } from "@/hooks/queries/photographer";
import { useToast } from "@/components/ui/toast";

const actions = [
  { key: "createBooking", icon: Calendar, route: "booking" },
  { key: "requestPayment", icon: Banknote, route: "payments" },
  { key: "shareGallery", icon: Share2, route: "gallery" },
] as const;

type QuickActionsCardProps = {
  clientId: string;
  clientName: string;
};

export function QuickActionsCard({ clientId, clientName }: QuickActionsCardProps) {
  const copy = CLIENT_PROFILE_COPY;
  const navigate = useNavigate();
  const { push } = useToast();
  const { data: galleries = [] } = usePhotographerGalleries();

  function handleAction(route: (typeof actions)[number]["route"]) {
    switch (route) {
      case "booking":
        navigate(`${ROUTES.photographer.bookingsNew}?client=${clientId}`);
        return;
      case "payments":
        navigate(ROUTES.photographer.paymentsForClient(clientName));
        return;
      case "gallery": {
        const target = clientGalleryRoute(galleries, clientId);
        if (!target) {
          push({
            title: copy.shareGallery,
            description: "Create a gallery for this client first.",
            variant: "info",
            actionLabel: "Create Gallery",
            href: ROUTES.photographer.galleryNewForClient(clientId),
          });
          return;
        }
        navigate(target);
      }
    }
  }

  return (
    <section className="space-y-2">
      {actions.map(({ key, icon: Icon, route }) => (
        <button
          key={key}
          type="button"
          onClick={() => handleAction(route)}
          className="flex w-full items-center gap-3 rounded-xl border border-border bg-gray-50 px-4 py-3 text-sm font-semibold text-charcoal transition-colors hover:bg-gray-100"
        >
          <Icon className="size-4 text-muted" aria-hidden />
          {copy[key]}
        </button>
      ))}
    </section>
  );
}
