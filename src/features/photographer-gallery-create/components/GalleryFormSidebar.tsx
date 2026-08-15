import { ChevronRight, Eye, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GALLERY_CREATE_COPY } from "@/constants/photographer-gallery-create";
import {
  type GalleryFormValues,
  type GalleryStatusSegment,
} from "@/types/domains/gallery";
import { cn } from "@/lib/utils";

type GalleryFormSidebarProps = {
  values: Pick<
    GalleryFormValues,
    | "galleryName"
    | "category"
    | "clientId"
    | "photoCount"
    | "storageUsedGb"
    | "storageTotalGb"
    | "statusSegment"
  >;
  clientName?: string;
  galleryId?: string;
  linkCopied?: boolean;
  onPreviewGallery?: () => void;
  onShareLink?: () => void;
};

const statusStyles: Record<GalleryStatusSegment, string> = {
  draft: "bg-charcoal text-white",
  editing: "bg-charcoal text-white",
  ready: "bg-green-600 text-white",
};

export function GalleryFormSidebar({
  values,
  clientName,
  galleryId,
  linkCopied = false,
  onPreviewGallery,
  onShareLink,
}: GalleryFormSidebarProps) {
  const copy = GALLERY_CREATE_COPY;
  const summary = copy.summary;
  const plan = copy.planUsage;
  const links = copy.quickLinks;
  const quickLinksEnabled = Boolean(galleryId);

  const client = clientName;
  const storagePercent = Math.min(
    100,
    Math.round((values.storageUsedGb / values.storageTotalGb) * 100),
  );
  const remaining = Math.max(
    0,
    Number((values.storageTotalGb - values.storageUsedGb).toFixed(1)),
  );

  const summaryRows = [
    {
      label: summary.galleryName,
      value: values.galleryName || "—",
    },
    {
      label: summary.client,
      value: client ?? "—",
    },
    {
      label: summary.category,
      value: copy.categories[values.category],
    },
    {
      label: summary.photoCount,
      value: summary.photos(values.photoCount),
    },
    {
      label: summary.storage,
      value: summary.storageDisplay(values.storageUsedGb),
    },
  ];

  return (
    <aside className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-xl bg-gold p-5 text-white shadow-card">
        <p className="text-[10px] font-bold tracking-wider text-white/80 uppercase">
          {summary.title}
        </p>

        <dl className="mt-4 space-y-3">
          {summaryRows.map((row) => (
            <div key={row.label}>
              <dt className="text-[10px] font-semibold tracking-wider text-white/70 uppercase">
                {row.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-white">
                {row.value}
              </dd>
            </div>
          ))}

          <div>
            <dt className="text-[10px] font-semibold tracking-wider text-white/70 uppercase">
              {summary.status}
            </dt>
            <dd className="mt-1">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  statusStyles[values.statusSegment],
                )}
              >
                {copy.statusLabels[values.statusSegment]}
              </span>
            </dd>
          </div>
        </dl>

        <p className="mt-4 border-t border-white/25 pt-4 text-xs italic leading-relaxed text-white/80">
          {summary.footerNote}
        </p>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 shadow-card">
        <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
          {plan.title}
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-charcoal">{plan.storageUsed}</span>
            <span className="font-bold text-charcoal">{storagePercent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gold transition-all"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-muted">{plan.remaining(remaining)}</p>
        </div>

        <Button variant="outline" size="sm" className="mt-4 w-full">
          {plan.upgradeStorage}
        </Button>
      </section>

      <section className="rounded-xl border border-border bg-white p-5 shadow-card">
        <p className="text-[10px] font-bold tracking-wider text-muted-light uppercase">
          {links.title}
        </p>

        <div className="mt-3 divide-y divide-border">
          <QuickLink
            icon={Eye}
            label={links.previewGallery}
            disabled={!quickLinksEnabled}
            onClick={onPreviewGallery}
          />
          <QuickLink
            icon={Share2}
            label={linkCopied ? links.linkCopied : links.shareLink}
            disabled={!quickLinksEnabled}
            onClick={onShareLink}
          />
        </div>

        {!quickLinksEnabled ? (
          <p className="mt-3 text-xs text-muted">{links.hint}</p>
        ) : null}
      </section>
    </aside>
  );
}

function QuickLink({
  icon: Icon,
  label,
  disabled = false,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 py-3 text-sm font-semibold transition-colors",
        disabled
          ? "cursor-not-allowed text-muted-light"
          : "text-charcoal hover:text-gold",
      )}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="size-4 text-muted" aria-hidden />
        {label}
      </span>
      <ChevronRight className="size-4 text-muted" aria-hidden />
    </button>
  );
}
