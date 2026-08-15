import { Download, Eye, Heart, Users } from "lucide-react";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { GalleryTabSection } from "@/features/photographer-gallery-detail/components/GalleryTabShared";
import type {
  GalleryActivity,
  GalleryAnalyticsData,
  PhotographerGallery,
} from "@/types/domains/gallery";

type GalleryAnalyticsTabProps = {
  gallery: PhotographerGallery;
  analytics: GalleryAnalyticsData;
  activities?: GalleryActivity[];
};

export function GalleryAnalyticsTab({
  gallery,
  analytics,
  activities = [],
}: GalleryAnalyticsTabProps) {
  const panel = GALLERIES_COPY.detail.tabPanels.analytics;
  const maxWeeklyViews = Math.max(
    ...analytics.weeklyViews.map((entry) => entry.value),
    1,
  );

  const kpis = [
    {
      label: panel.totalViews,
      value: gallery.views.toLocaleString(),
      trend: panel.viewsTrend,
      icon: Eye,
    },
    {
      label: panel.downloads,
      value: gallery.downloads.toLocaleString(),
      trend: panel.downloadsTrend,
      icon: Download,
    },
    {
      label: panel.favorites,
      value: gallery.likes.toLocaleString(),
      trend: panel.favoritesTrend,
      icon: Heart,
    },
    {
      label: panel.uniqueVisitors,
      value: analytics.uniqueVisitors.toLocaleString(),
      trend: panel.visitorsTrend,
      icon: Users,
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <AnalyticsKpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <GalleryTabSection title={panel.weeklyViews}>
          <div className="flex h-44 items-end justify-between gap-2">
            {analytics.weeklyViews.map((entry) => (
              <div
                key={entry.day}
                className="flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                <div className="flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t-md bg-charcoal transition-all"
                    style={{
                      height: `${Math.max(12, (entry.value / maxWeeklyViews) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-muted">
                  {entry.day}
                </span>
              </div>
            ))}
          </div>
        </GalleryTabSection>

        <GalleryTabSection title={panel.engagement}>
          <div className="space-y-4">
            <div>
              <div className="flex items-end justify-between gap-3">
                <p className="text-3xl font-bold tracking-tight text-charcoal">
                  {analytics.engagementRate}%
                </p>
                <p className="text-xs text-muted">
                  {panel.avgSession}:{" "}
                  <span className="font-semibold text-charcoal">
                    {analytics.avgSessionDuration}
                  </span>
                </p>
              </div>
              <p className="mt-1 text-xs text-muted">{panel.engagementHint}</p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gold transition-all"
                style={{ width: `${analytics.engagementRate}%` }}
              />
            </div>

            <dl className="grid grid-cols-3 gap-3 pt-2">
              <MetricPill label={panel.totalViews} value={gallery.views} />
              <MetricPill label={panel.favorites} value={gallery.likes} />
              <MetricPill label={panel.downloads} value={gallery.downloads} />
            </dl>
          </div>
        </GalleryTabSection>
      </div>

      <GalleryTabSection title={panel.topPhotos}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {panel.columns.photo}
                </th>
                <th className="pb-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {panel.columns.views}
                </th>
                <th className="pb-3 text-left text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {panel.columns.downloads}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analytics.topPhotos.map((photo) => (
                <tr key={photo.rank}>
                  <td className="py-3 text-sm font-semibold text-charcoal">
                    <span className="mr-2 text-xs font-bold text-muted">
                      #{photo.rank}
                    </span>
                    {photo.label}
                  </td>
                  <td className="py-3 text-sm text-muted">
                    {photo.views.toLocaleString()}
                  </td>
                  <td className="py-3 text-sm text-muted">
                    {photo.downloads.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GalleryTabSection>

      <GalleryTabSection title={panel.activityLog}>
        {activities.length === 0 ? (
          <p className="text-sm text-muted">{panel.noActivity}</p>
        ) : (
          <ol className="divide-y divide-border">
            {activities.map((activity) => (
              <li key={activity.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-charcoal">{activity.description}</p>
                <p className="mt-1 text-[10px] font-semibold tracking-wider text-muted-light uppercase">
                  {activity.timestamp}
                </p>
              </li>
            ))}
          </ol>
        )}
      </GalleryTabSection>
    </div>
  );
}

function AnalyticsKpiCard({
  label,
  value,
  trend,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend: string;
  icon: typeof Eye;
}) {
  return (
    <article className="rounded-xl border border-border bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-gold-light text-gold">
          <Icon className="size-4" aria-hidden />
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-600">
          {trend}
        </span>
      </div>
      <p className="mt-4 text-[11px] font-semibold tracking-wider text-muted-light uppercase">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-charcoal">
        {value}
      </p>
    </article>
  );
}

function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
      <dt className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-bold text-charcoal">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
