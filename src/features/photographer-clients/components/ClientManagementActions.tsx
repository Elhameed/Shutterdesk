import { useEffect, useId, useRef, useState } from "react";
import {
  Banknote,
  Calendar,
  Eye,
  Image,
  MessageSquare,
  MoreVertical,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/toast";
import { Tooltip } from "@/components/ui/tooltip";
import { CLIENTS_COPY } from "@/constants/photographer-clients";
import { ROUTES } from "@/constants/routes";
import { clientGalleryRoute } from "@/features/photographer-clients/lib/client-gallery-navigation";
import { usePhotographerGalleries } from "@/hooks/queries/photographer";
import type { Client } from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

type ClientManagementActionsProps = {
  client: Client;
  variant: "list" | "card";
};

type MenuItem = {
  label: string;
  icon: typeof Eye;
  onClick: () => void;
};

function useClientGalleryNavigation(client: Client) {
  const navigate = useNavigate();
  const { push } = useToast();
  const { data: galleries = [] } = usePhotographerGalleries();
  const copy = CLIENTS_COPY;

  return function goToClientGalleries() {
    const route = clientGalleryRoute(galleries, client.id);

    if (!route) {
      push({
        title: copy.noGalleriesForClientTitle,
        description: copy.noGalleriesForClient,
        variant: "info",
        actionLabel: copy.moreActionsMenu.createGallery,
        href: ROUTES.photographer.galleryNewForClient(client.id),
      });
      return;
    }

    navigate(route);
  };
}

function ClientActionMenu({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const menuId = useId();
  const copy = CLIENTS_COPY;
  const goToClientGalleries = useClientGalleryNavigation(client);

  const items: MenuItem[] = [
    {
      label: copy.moreActionsMenu.viewProfile,
      icon: Eye,
      onClick: () => navigate(ROUTES.photographer.clientDetail(client.id)),
    },
    {
      label: copy.moreActionsMenu.viewGalleries,
      icon: Image,
      onClick: goToClientGalleries,
    },
    {
      label: copy.moreActionsMenu.viewBookingHistory,
      icon: Calendar,
      onClick: () =>
        navigate(ROUTES.photographer.clientDetailTab(client.id, "timeline")),
    },
    {
      label: copy.moreActionsMenu.createGallery,
      icon: Plus,
      onClick: () =>
        navigate(ROUTES.photographer.galleryNewForClient(client.id)),
    },
    {
      label: copy.moreActionsMenu.viewPayments,
      icon: Banknote,
      onClick: () =>
        navigate(ROUTES.photographer.paymentsForClient(client.name)),
    },
    {
      label: copy.moreActionsMenu.sendMessage,
      icon: MessageSquare,
      onClick: () =>
        navigate(ROUTES.photographer.clientDetail(client.id)),
    },
  ];

  return (
    <div
      id={menuId}
      role="menu"
      className="absolute top-full right-0 z-20 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-border bg-white py-1 shadow-lg"
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-charcoal transition-colors hover:bg-gray-50"
          onClick={() => {
            item.onClick();
            onClose();
          }}
        >
          <item.icon className="size-4 shrink-0 text-muted" aria-hidden />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function ClientManagementActions({
  client,
  variant,
}: ClientManagementActionsProps) {
  const copy = CLIENTS_COPY;
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const goToClientGalleries = useClientGalleryNavigation(client);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const iconButtonClass = cn(
    "rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-100 hover:text-charcoal",
    variant === "card" &&
      "flex size-9 shrink-0 items-center justify-center border border-border hover:bg-gray-50",
  );

  return (
    <div className="flex items-center gap-1">
      {variant === "list" && (
        <Tooltip label={copy.viewClient}>
          <button
            type="button"
            onClick={() => navigate(ROUTES.photographer.clientDetail(client.id))}
            className={iconButtonClass}
            aria-label={copy.viewClient}
          >
            <Eye className="size-4" />
          </button>
        </Tooltip>
      )}

      {variant === "card" && (
        <Tooltip label={copy.viewPayments}>
          <button
            type="button"
            onClick={() =>
              navigate(ROUTES.photographer.paymentsForClient(client.name))
            }
            className={iconButtonClass}
            aria-label={copy.viewPayments}
          >
            <Banknote className="size-4" />
          </button>
        </Tooltip>
      )}

      <Tooltip
        label={variant === "list" ? copy.viewGalleryAction : copy.viewGallery}
      >
        <button
          type="button"
          onClick={goToClientGalleries}
          className={iconButtonClass}
          aria-label={
            variant === "list" ? copy.viewGalleryAction : copy.viewGallery
          }
        >
          <Image className="size-4" />
        </button>
      </Tooltip>

      {variant === "list" && (
        <div className="relative" ref={menuRef}>
          <Tooltip label={copy.moreActions}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={iconButtonClass}
              aria-label={copy.moreActions}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <MoreVertical className="size-4" />
            </button>
          </Tooltip>
          {menuOpen && (
            <ClientActionMenu
              client={client}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
