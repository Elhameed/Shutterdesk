import { Download, Eye } from "lucide-react";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { GalleryTabSection } from "@/features/photographer-gallery-detail/components/GalleryTabShared";
import type {
  GalleryActivity,
  GalleryAnalyticsData,
} from "@/types/domains/gallery";

type GalleryAnalyticsTabProps = {
  analytics: GalleryAnalyticsData;
  activities?: GalleryActivity[];
};

/**
 * Shows the two counters the app actually records, plus the activity log.
 *
 * This tab previously also showed unique visitors, an engagement rate, an
 * average session duration, a weekly views chart and a "top performing photos"
 * table. None of those were measured — they were computed from the view count
 * with fixed multipliers, and the photo names were hardcoded. Per-visitor and
 * per-photo activity is not tracked at all, so there is nothing to show yet.
 */
export function GalleryAnalyticsTab({
  analytics,
  activities = [],
}: GalleryAnalyticsTabProps) {
  const panel = GALLERIES_COPY.detail.tabPanels.analytics;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <AnalyticsKpiCard
          label={panel.totalViews}
          value={analytics.totalViews.toLocaleString()}
          icon={Eye}
        />
        <AnalyticsKpiCard
          label={panel.downloads}
          value={analytics.totalDownloads.toLocaleString()}
          icon={Download}
        />
      </div>

      <GalleryTabSection title={panel.activityLog}>
        {activities.length === 0 ? (
          <p className="text-sm text-ink-soft">{panel.noActivity}</p>
        ) : (
          <ol className="divide-y divide-border">
            {activities.map((activity) => (
              <li key={activity.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-ink">{activity.description}</p>
                <p className="mt-1 text-[10px] font-medium text-ink-faint">
                  {activity.timestamp}
                </p>
              </li>
            ))}
          </ol>
        )}
      </GalleryTabSection>

      <p className="text-xs text-ink-faint">{panel.limitedTrackingNote}</p>
    </div>
  );
}

function AnalyticsKpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Eye;
}) {
  return (
    <article className="rounded-md border border-border bg-panel p-5">
      <div className="flex size-9 items-center justify-center rounded-sm bg-accent-tint text-accent">
        <Icon className="size-4" aria-hidden />
      </div>
      <p className="mt-4 text-[11px] font-medium text-ink-faint">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-ink">{value}</p>
    </article>
  );
}
