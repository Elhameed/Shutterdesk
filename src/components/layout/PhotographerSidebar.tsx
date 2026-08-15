import { NavLink } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";
import { Logo } from "@/components/common/Logo";
import { NotificationNavBadge } from "@/components/common/NotificationNavBadge";
import {
  PHOTOGRAPHER_ACCOUNT_NAV_ITEMS,
  PHOTOGRAPHER_NAV_ITEMS,
  type PhotographerNavItem,
} from "@/constants/photographer-dashboard";
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
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-light"
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
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-gray-100 text-gold"
            : "text-muted hover:bg-gray-50 hover:text-charcoal",
        )
      }
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
    <aside
      className={cn(
        "flex h-screen w-60 shrink-0 flex-col border-r border-border bg-white",
        className,
      )}
    >
      <div className="px-5 pt-5 pb-2">
        {dashboard?.user.studioLogo ? (
          <img
            src={dashboard.user.studioLogo}
            alt={sidebarUser.name}
            className="h-8 w-auto max-w-[140px] object-contain"
          />
        ) : (
          <Logo size="md" />
        )}
      </div>

      <nav className="flex flex-1 flex-col overflow-y-auto px-3 pb-4 pt-4">
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

          <div className="mt-4 border-t border-border pt-4">
            <div className="flex items-center gap-3 px-3">
              {authUser ? (
                <img
                  src={sidebarUser.avatar || undefined}
                  alt={sidebarUser.name}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <Skeleton className="size-8 shrink-0 rounded-full" />
              )}
              <div className="min-w-0 flex-1">
                {authUser ? (
                  <>
                    <p className="truncate text-sm font-medium text-charcoal">
                      {sidebarUser.name}
                    </p>
                    <p className="truncate text-[10px] text-muted">
                      {sidebarUser.role}
                    </p>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-1/2" />
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
