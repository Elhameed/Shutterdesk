import { assetUrl } from "@/lib/asset-url";
import type {
  PhotographerDashboardSummary,
  UpcomingShoot,
} from "@/types/domains/dashboard";

type ApiDashboard = {
  user: {
    name: string;
    firstName: string;
    role: string;
    avatarAssetKey: string;
    studioLogoAssetKey?: string | null;
  };
  stats: PhotographerDashboardSummary["stats"];
  upcomingShoots: Array<{
    id: string;
    clientName: string;
    shootType: string;
    date: string;
    time: string;
    location: string;
    status: "confirmed" | "paid";
    avatarAssetKey: string;
  }>;
  profileCompletion: PhotographerDashboardSummary["profileCompletion"];
  recentActivity: PhotographerDashboardSummary["recentActivity"];
};

function resolveAvatar(assetKey: string) {
  if (assetKey.startsWith("http") || assetKey.startsWith("data:")) return assetKey;
  return assetUrl(assetKey) || assetUrl("app/user-avatar");
}

export function mapApiPhotographerDashboard(api: ApiDashboard): PhotographerDashboardSummary {
  return {
    user: {
      name: api.user.name,
      firstName: api.user.firstName,
      role: api.user.role,
      avatar: resolveAvatar(api.user.avatarAssetKey),
      ...(api.user.studioLogoAssetKey
        ? { studioLogo: resolveAvatar(api.user.studioLogoAssetKey) }
        : {}),
    },
    stats: api.stats.map((stat) => ({
      ...stat,
      tone: stat.tone ?? "default",
    })),
    upcomingShoots: api.upcomingShoots.map(
      (shoot): UpcomingShoot => ({
        id: shoot.id,
        clientName: shoot.clientName,
        shootType: shoot.shootType,
        date: shoot.date,
        time: shoot.time,
        location: shoot.location,
        status: shoot.status,
        avatar: resolveAvatar(shoot.avatarAssetKey),
      }),
    ),
    profileCompletion: api.profileCompletion,
    recentActivity: api.recentActivity,
  };
}
