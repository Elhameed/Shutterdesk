import { NavLink } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/app/AuthProvider";
import { Logo } from "@/components/common/Logo";
import { NotificationNavBadge } from "@/components/common/NotificationNavBadge";
import { appAssets } from "@/constants/assets";
import {
  CLIENT_BOOK_SESSION_NAV,
  CLIENT_NAV_ITEMS,
  type ClientNavItem,
} from "@/constants/client-dashboard";
import {
  RAIL_ITEM,
  RAIL_SHELL,
  railItemState,
} from "@/components/layout/rail-nav";
import { CLIENT_SETTINGS_COPY } from "@/constants/client-settings";
import { ROUTES } from "@/constants/routes";
import { useClientUnreadNotificationCount } from "@/hooks/queries/notifications";
import { Skeleton } from "@/components/skeletons";
import { resolveMediaUrl } from "@/lib/media-url";
import { cn } from "@/lib/utils";

type ClientSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  onOpenSettings?: () => void;
};

function NavItem({
  item,
  onNavigate,
  unreadCount = 0,
}: {
  item: ClientNavItem;
  onNavigate?: () => void;
  unreadCount?: number;
}) {
  const Icon = item.icon;
  const showBadge = item.to === ROUTES.client.notifications;

  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.client.dashboard}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          RAIL_ITEM,
          // `highlight` used to paint a solid gold fill, which read as a
          // permanently-active item. It now reads as emphasis without
          // competing with the real active state.
          item.highlight
            ? "text-rail-text-active border-transparent bg-white/[0.07] hover:bg-white/10"
            : railItemState(isActive),
        )
      }
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">{item.label}</span>
      {showBadge ? <NotificationNavBadge count={unreadCount} /> : null}
    </NavLink>
  );
}

export function ClientSidebar({
  className,
  onNavigate,
  onOpenSettings,
}: ClientSidebarProps) {
  const { user: authUser } = useAuth();
  const { data: unreadCount = 0 } = useClientUnreadNotificationCount();
  const settingsCopy = CLIENT_SETTINGS_COPY;
  const displayName = authUser?.fullName ?? "Client";
  const avatarSrc = resolveMediaUrl(authUser?.avatarUrl, appAssets.userAvatar);

  return (
    <aside className={cn(RAIL_SHELL, className)}>
      <div className="px-5 pt-5 pb-2">
        <Logo size="md" tone="light" />
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 pt-4 pb-4">
        <div className="flex flex-col gap-1">
          {CLIENT_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              onNavigate={onNavigate}
              unreadCount={unreadCount}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-6">
          <NavItem
            item={CLIENT_BOOK_SESSION_NAV}
            onNavigate={onNavigate}
          />

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-3">
              {authUser ? (
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <Skeleton className="size-8 shrink-0 rounded-full bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                {authUser ? (
                  <>
                    <p className="text-rail-text-active truncate text-sm font-medium">
                      {displayName}
                    </p>
                    <p className="text-rail-text truncate text-[11px]">Client</p>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-2/3 bg-white/10" />
                    <Skeleton className="h-2.5 w-1/2 bg-white/10" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onOpenSettings}
                className="text-rail-text hover:text-rail-text-active flex size-8 shrink-0 items-center justify-center rounded-sm transition-colors hover:bg-white/10"
                aria-label={settingsCopy.title}
              >
                <Settings className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
