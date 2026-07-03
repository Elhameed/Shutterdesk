import {
  Camera,
  Clock,
  Copy,
  Download,
  Image as ImageIcon,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { AppImage } from "@/components/ui/image";
import { Tooltip } from "@/components/ui/tooltip";
import { SERVICES_COPY } from "@/constants/photographer-services";
import { ROUTES } from "@/constants/routes";
import { SERVICE_BADGE_STYLES } from "@/constants/status-colors";
import type {
  ServiceDetailIcon,
  ServicePackage,
} from "@/types/domains/service";
import { cn } from "@/lib/utils";

const detailIcons: Record<ServiceDetailIcon, LucideIcon> = {
  clock: Clock,
  camera: Camera,
  pencil: Pencil,
  image: ImageIcon,
  download: Download,
};

type ServicePackageCardProps = {
  service: ServicePackage;
  onDuplicate?: (service: ServicePackage) => void;
  onDelete?: (service: ServicePackage) => void;
  isDuplicating?: boolean;
  isDeleting?: boolean;
};

export function ServicePackageCard({
  service,
  onDuplicate,
  onDelete,
  isDuplicating = false,
  isDeleting = false,
}: ServicePackageCardProps) {
  const copy = SERVICES_COPY;
  const actionsDisabled = isDuplicating || isDeleting;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card">
      <div className="relative h-44 sm:h-48">
        {service.hasCoverImage && service.coverImage ? (
          <AppImage src={service.coverImage} alt={service.title} />
        ) : (
          <div
            className="flex size-full items-center justify-center bg-gray-100"
            aria-hidden
          >
            <ImageIcon className="size-10 text-muted-light" />
          </div>
        )}

        {service.badges.length > 0 && (
          <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
            {service.badges.map((badge) => (
              <span
                key={badge}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                  SERVICE_BADGE_STYLES[badge],
                )}
              >
                {copy.badges[badge]}
              </span>
            ))}
          </div>
        )}

        {!service.isActive &&
          !service.badges.includes("draft") &&
          !service.badges.includes("archived") && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase",
                SERVICE_BADGE_STYLES.draft,
              )}
            >
              {copy.badges.draft}
            </span>
          </div>
        )}

        <Tooltip label={copy.edit} className="absolute top-3 right-3 z-10">
          <Link
            to={ROUTES.photographer.servicePackageEdit(service.id)}
            className="flex size-8 items-center justify-center rounded-full border border-border/50 bg-white text-charcoal shadow-sm transition-colors hover:bg-gray-50"
            aria-label={copy.edit}
          >
            <Pencil className="size-3.5" strokeWidth={2} />
          </Link>
        </Tooltip>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-charcoal">{service.title}</h3>
          <p className="shrink-0 text-sm font-bold text-charcoal">
            {copy.priceDisplay(service.price)}
          </p>
        </div>

        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">
          {service.description}
        </p>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3 text-xs text-muted">
            {service.details.map((detail) => {
              const Icon = detailIcons[detail.icon];

              return (
                <span
                  key={detail.label}
                  className="flex min-w-0 items-center gap-1.5"
                >
                  <Icon className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{detail.label}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-[10px] font-semibold tracking-wider text-muted-light uppercase">
              {copy.totalRevenue}
            </p>
            <p className="mt-0.5 text-lg font-bold text-charcoal">
              {copy.revenueDisplay(service.totalRevenue)}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip label={copy.duplicate} side="top">
              <button
                type="button"
                onClick={() => onDuplicate?.(service)}
                disabled={actionsDisabled}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-gray-50 hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={copy.duplicate}
              >
                <Copy className="size-4" />
              </button>
            </Tooltip>
            <Tooltip label={copy.delete} side="top">
              <button
                type="button"
                onClick={() => onDelete?.(service)}
                disabled={actionsDisabled}
                className="rounded-lg p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={copy.delete}
              >
                <Trash2 className="size-4" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </article>
  );
}
