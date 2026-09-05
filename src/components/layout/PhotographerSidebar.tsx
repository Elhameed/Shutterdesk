import { NavLink } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";
import { Logo } from "@/components/common/Logo";
import { NotificationNavBadge } from "@/components/common/NotificationNavBadge";
import {
  PHOTOGRAPHER_ACCOUNT_NAV_ITEMS,
  PHOTOGRAPHER_NAV_ITEMS,
  type PhotographerNavItem,
} from "@/constants/photographer-dashboard";
import {
  RAIL_ITEM,
  RAIL_SHELL,
  railItemState,
} from "@/components/layout/rail-nav";
import { ROUTES } from "@/constants/routes";
import { usePhotographerDashboard } from "@/hooks/queries/photographer";
import { usePhotographerUnreadNotificationCount } from "@/hooks/queries/notifications";
import { Skeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

type PhotographerSidebarProps = {
  className?: string;
  onNavigate?: () => void;
};

function NavItem({
  item,
  onNavigate,
  unreadCount = 0,
}: {
  item: PhotographerNavItem;
  onNavigate?: () => void;
  unreadCount?: number;
}) {
  const Icon = item.icon;
  const showBadge = item.to === ROUTES.photographer.notifications;

  if (!item.available) {
    return (
      <span
        className={cn(RAIL_ITEM, "text-rail-text/45")}
        title="Coming soon"
      >
        <Icon className="size-[18px] shrink-0" aria-hidden />
        {item.label}
      </span>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === ROUTES.photographer.dashboard}
      onClick={onNavigate}
      className={({ isActive }) => cn(RAIL_ITEM, railItemState(isActive))}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span className="min-w-0 flex-1">{item.label}</span>
      {showBadge ? <NotificationNavBadge count={unreadCount} /> : null}
    </NavLink>
  );
}

export function PhotographerSidebar({
  className,
  onNavigate,
}: PhotographerSidebarProps) {
  const { user: authUser } = useAuth();
  const { data: dashboard } = usePhotographerDashboard();
  const { data: unreadCount = 0 } = usePhotographerUnreadNotificationCount();

  const sidebarUser = dashboard?.user ?? {
    name: authUser?.fullName ?? "Photographer",
    role: "Studio Owner",
    avatar: "",
  };

  return (
    <aside className={cn(RAIL_SHELL, className)}>
      <div className="px-5 pt-5 pb-2">
        {dashboard?.user.studioLogo ? (
          <img
            src={dashboard.user.studioLogo}
            alt={sidebarUser.name}
            className="h-8 w-auto max-w-[140px] object-contain"
          />
        ) : (
          <Logo size="md" tone="light" />
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 pt-4 pb-4">
        <div className="flex flex-col gap-1">
          {PHOTOGRAPHER_NAV_ITEMS.map((item) => (
            <NavItem key={item.label} item={item} onNavigate={onNavigate} />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1 pt-6">
          {PHOTOGRAPHER_ACCOUNT_NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              onNavigate={onNavigate}
              unreadCount={unreadCount}
            />
          ))}

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 px-3">
              {authUser ? (
                <img
                  src={sidebarUser.avatar || undefined}
                  alt={sidebarUser.name}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <Skeleton className="size-8 shrink-0 rounded-full bg-white/10" />
              )}
              <div className="min-w-0 flex-1">
                {authUser ? (
                  <>
                    <p className="text-rail-text-active truncate text-sm font-medium">
                      {sidebarUser.name}
                    </p>
                    <p className="text-rail-text truncate text-[11px]">
                      {sidebarUser.role}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-2/3 bg-white/10" />
                    <Skeleton className="h-2.5 w-1/2 bg-white/10" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
