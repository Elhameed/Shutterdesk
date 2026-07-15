import { Link } from "react-router-dom";
import { ImagePlus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BOOKING_DETAIL_COPY } from "@/constants/photographer-booking-detail";
import { ROUTES } from "@/constants/routes";
import type { BookingLifecycleStage } from "@/types/domains/booking";
import { cn } from "@/lib/utils";

const GALLERY_STAGES = [
  "notStarted",
  "editing",
  "ready",
  "delivered",
] as const;

type GalleryStage = (typeof GALLERY_STAGES)[number];

type GalleryStatusCardProps = {
  bookingId: string;
  galleryId: string | null;
  currentStage: number;
  lifecycleStage: BookingLifecycleStage;
  galleryReleaseBlocked?: boolean;
  galleryReleaseOverride?: boolean;
  onReleaseOverride?: () => void;
  isOverrideSubmitting?: boolean;
};

function getBarStyle(index: number, currentStage: number): string {
  if (index < currentStage) return "bg-gold-hover";
  if (index === currentStage) return "bg-gold";
  return "bg-gray-200";
}

function getLabelStyle(index: number, currentStage: number): string {
  if (index < currentStage) return "font-medium text-charcoal";
  if (index === currentStage) return "font-bold text-charcoal";
  return "text-muted-light";
}

function getStageLabel(stage: GalleryStage, index: number, currentStage: number): string {
  const copy = BOOKING_DETAIL_COPY;
  const base = copy.galleryStages[stage];

  if (index === currentStage) {
    return copy.galleryActiveLabel(base);
  }

  return base;
}

function resolveGalleryAction(
  bookingId: string,
  galleryId: string | null,
  lifecycleStage: BookingLifecycleStage,
  galleryReleaseBlocked: boolean,
) {
  const copy = BOOKING_DETAIL_COPY;
  const isPostSession =
    lifecycleStage === "session_completed" ||
    lifecycleStage === "gallery_delivery";

  if (galleryReleaseBlocked) {
    return null;
  }

  if (!isPostSession) {
    return null;
  }

  if (galleryId) {
    return {
      label: copy.manageGallery,
      href: ROUTES.photographer.galleryDetail(galleryId),
      variant: "default" as const,
    };
  }

  return {
    label: copy.createGallery,
    href: ROUTES.photographer.galleryNewForBooking(bookingId),
    variant: "gold" as const,
  };
}

export function GalleryStatusCard({
  bookingId,
  galleryId,
  currentStage,
  lifecycleStage,
  galleryReleaseBlocked = false,
  galleryReleaseOverride = false,
  onReleaseOverride,
  isOverrideSubmitting = false,
}: GalleryStatusCardProps) {
  const copy = BOOKING_DETAIL_COPY;
  const action = resolveGalleryAction(
    bookingId,
    galleryId,
    lifecycleStage,
    galleryReleaseBlocked,
  );
  const isPostSession =
    lifecycleStage === "session_completed" ||
    lifecycleStage === "gallery_delivery";
  const isBalanceDue = lifecycleStage === "awaiting_balance";

  return (
    <section
      className={cn(
        "rounded-xl border bg-white p-5 shadow-card",
        (isPostSession || isBalanceDue) && !galleryId && !galleryReleaseBlocked
          ? "border-gold/30 ring-1 ring-gold/10"
          : "border-border",
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-charcoal">{copy.galleryStatus}</h2>
          {galleryReleaseBlocked ? (
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-gold" aria-hidden />
              {copy.galleryBlockedHint}
            </p>
          ) : isPostSession && !galleryId ? (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {copy.galleryCreateHint}
            </p>
          ) : null}
          {galleryReleaseOverride ? (
            <p className="mt-2 text-xs font-medium text-gold">
              {copy.galleryReleaseEnabled}
            </p>
          ) : null}
        </div>
        {action ? (
          <Button variant={action.variant} size="sm" className="shrink-0" asChild>
            <Link to={action.href}>
              {!galleryId ? <ImagePlus className="size-4" aria-hidden /> : null}
              {action.label}
            </Link>
          </Button>
        ) : null}
      </div>

      {galleryReleaseBlocked && onReleaseOverride && !galleryReleaseOverride ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mb-4 w-full"
          disabled={isOverrideSubmitting}
          onClick={onReleaseOverride}
        >
          {copy.releaseGalleryAnyway}
        </Button>
      ) : null}

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {GALLERY_STAGES.map((stage, index) => (
          <div key={stage} className="min-w-0">
            <div
              className={cn(
                "h-2.5 rounded-full",
                getBarStyle(index, currentStage),
              )}
            />
            <p
              className={cn(
                "mt-2 text-center text-[10px] sm:text-xs",
                getLabelStyle(index, currentStage),
              )}
            >
              {getStageLabel(stage, index, currentStage)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
