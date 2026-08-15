import type { ReactNode } from "react";
import {
  Archive,
  Calendar,
  Download,
  Eye,
  FileText,
  Heart,
  MapPin,
  Send,
  Share2,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GALLERIES_COPY } from "@/constants/photographer-galleries";
import { ROUTES } from "@/constants/routes";
import type {
  GalleryActivity,
  GalleryActivityType,
  GalleryDetailMeta,
  PhotographerGallery,
} from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

const activityIcons: Record<GalleryActivityType, LucideIcon> = {
  favorite: Heart,
  share: Share2,
  download: Download,
  view: Eye,
};

const activityIconStyles: Record<GalleryActivityType, string> = {
  favorite: "bg-gold-light text-gold",
  share: "bg-charcoal text-white",
  download: "bg-gray-100 text-muted",
  view: "bg-gray-100 text-muted",
};

type GalleryDetailSidebarProps = {
  gallery: PhotographerGallery;
  meta: GalleryDetailMeta;
  isNotifyLoading?: boolean;
  isExportLoading?: boolean;
  isArchiveLoading?: boolean;
  onNotifyClient?: () => void;
  onExportReport?: () => void;
  onArchiveGallery?: () => void;
  onViewAllActivity?: () => void;
};

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-5 shadow-card">
      <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function GalleryDetailSidebar({
  gallery,
  meta,
  isNotifyLoading = false,
  isExportLoading = false,
  isArchiveLoading = false,
  onNotifyClient,
  onExportReport,
  onArchiveGallery,
  onViewAllActivity,
}: GalleryDetailSidebarProps) {
  const copy = GALLERIES_COPY.detail.sidebar;
  const isArchived = gallery.status === "archived";

  return (
    <aside className="flex flex-col gap-4">
      <SidebarSection title={copy.clientInfo}>
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-light text-sm font-bold text-charcoal">
            {meta.clientInitials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-charcoal">
              {gallery.clientName}
            </p>
            <p className="truncate text-xs text-muted">{meta.clientEmail}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
          <Link to={ROUTES.photographer.clientDetail(meta.clientId)}>
            {copy.viewProfile}
          </Link>
        </Button>
      </SidebarSection>

      <SidebarSection title={copy.summary}>
        <dl className="space-y-4">
          <div>
            <dt className="flex items-center gap-2 text-xs font-semibold text-charcoal">
              <Calendar className="size-3.5 text-muted" aria-hidden />
              {copy.shootDate}
            </dt>
            <dd className="mt-1 pl-6 text-xs text-muted">{meta.shootDate}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-xs font-semibold text-charcoal">
              <MapPin className="size-3.5 text-muted" aria-hidden />
              {copy.location}
            </dt>
            <dd className="mt-1 pl-6 text-xs text-muted">{meta.location}</dd>
          </div>
        </dl>
      </SidebarSection>

      <div className="space-y-2">
        <Button
          variant="gold"
          size="sm"
          className="w-full gap-2"
          disabled={isArchived || isNotifyLoading}
          onClick={onNotifyClient}
        >
          <Send className="size-4" />
          {copy.notifyClient}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          disabled={isExportLoading}
          onClick={onExportReport}
        >
          <FileText className="size-4" />
          {copy.exportReport}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          disabled={isArchived || isArchiveLoading}
          onClick={onArchiveGallery}
        >
          <Archive className="size-4" />
          {copy.archiveGallery}
        </Button>
      </div>

      <SidebarSection title={copy.activityLog}>
        {meta.activities.length === 0 ? (
          <p className="text-xs text-muted">{copy.noActivity}</p>
        ) : (
          <ol className="space-y-0">
            {meta.activities.slice(0, 5).map((activity, index, items) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={index === items.length - 1}
              />
            ))}
          </ol>
        )}
        <button
          type="button"
          className="mt-4 w-full text-center text-xs font-bold text-charcoal transition-colors hover:text-gold"
          onClick={onViewAllActivity}
        >
          {copy.viewAllActivity}
        </button>
      </SidebarSection>
    </aside>
  );
}

function ActivityItem({
  activity,
  isLast,
}: {
  activity: GalleryActivity;
  isLast: boolean;
}) {
  const Icon = activityIcons[activity.type];

  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!isLast && (
        <span
          className="absolute top-8 left-4 h-[calc(100%-12px)] w-px bg-border"
          aria-hidden
        />
      )}
      <span
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
          activityIconStyles[activity.type],
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm text-charcoal">{activity.description}</p>
        <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-muted-light uppercase">
          {activity.timestamp}
        </p>
      </div>
    </li>
  );
}
