import { useState } from "react";
import {
  Camera,
  Images,
  MapPin,
  RefreshCw,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppImage } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_LABELS,
  CLIENT_BOOK_SESSION_COPY,
  DURATION_BADGE_LABELS,
  FEATURED_BADGE_LABELS,
  FEATURED_BADGE_PRIORITY,
  LOCATION_TYPE_LABELS,
  PACKAGE_DESCRIPTION_LIMIT,
  formatRwfPrice,
} from "@/constants/client-book-session";
import type { ServicePackage } from "@/types/domains/service";
import { serviceCoverDisplayUrl } from "@/services/service-mapper";
import { cn } from "@/lib/utils";

type BookSessionPackageCardProps = {
  pkg: ServicePackage;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

type MetaItem = { icon: LucideIcon; label: string };

/** Build the meta row, skipping any field the photographer didn't provide. */
function resolveMetaItems(pkg: ServicePackage): MetaItem[] {
  const items: (MetaItem | false)[] = [
    pkg.editedPhotos > 0 && {
      icon: Camera,
      label: `${pkg.editedPhotos} edited photos`,
    },
    { icon: MapPin, label: LOCATION_TYPE_LABELS[pkg.locationType] },
    pkg.revisions > 0 && {
      icon: RefreshCw,
      label: `${pkg.revisions} revision${pkg.revisions === 1 ? "" : "s"}`,
    },
    pkg.photographers > 1 && {
      icon: Users,
      label: `${pkg.photographers} photographers`,
    },
    pkg.onlineGallery && { icon: Images, label: "Online gallery" },
  ];

  return items.filter((item): item is MetaItem => Boolean(item));
}

export function BookSessionPackageCard({
  pkg,
  isSelected,
  onSelect,
}: BookSessionPackageCardProps) {
  const copy = CLIENT_BOOK_SESSION_COPY.packageStep;
  const [expanded, setExpanded] = useState(false);

  const featuredBadge = FEATURED_BADGE_PRIORITY.find((badge) =>
    pkg.badges.includes(badge),
  );
  const featuredLabel = featuredBadge
    ? FEATURED_BADGE_LABELS[featuredBadge]
    : undefined;

  const description = pkg.description.trim();
  const isLongDescription = description.length > PACKAGE_DESCRIPTION_LIMIT;
  const shownDescription =
    expanded || !isLongDescription
      ? description
      : `${description.slice(0, PACKAGE_DESCRIPTION_LIMIT).trimEnd()}…`;

  const metaItems = resolveMetaItems(pkg);

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-xl border bg-white transition-shadow",
        isSelected
          ? "border-gold ring-1 ring-gold"
          : "border-border hover:shadow-md",
      )}
    >
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-gray-100">
        <AppImage
          src={serviceCoverDisplayUrl(pkg.coverImage)}
          alt=""
          wrapperClassName="absolute inset-0"
        />
        {featuredLabel ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold tracking-wide text-charcoal uppercase shadow-sm">
            <Sparkles className="size-3" aria-hidden />
            {featuredLabel}
          </span>
        ) : null}
        <span className="absolute top-3 right-3 rounded-full bg-charcoal/75 px-2.5 py-1 text-[10px] font-bold tracking-wide text-white uppercase">
          {DURATION_BADGE_LABELS[pkg.duration]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-muted uppercase">
          {CATEGORY_LABELS[pkg.category]}
        </span>

        <div className="mt-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-charcoal">{pkg.title}</h3>
          <p className="shrink-0 text-sm font-bold text-gold">
            {formatRwfPrice(pkg.price)}
          </p>
        </div>

        {description ? (
          <div className="mt-2">
            <p className="text-xs leading-relaxed text-muted">
              {shownDescription}
            </p>
            {isLongDescription ? (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1 text-xs font-semibold text-charcoal transition-colors hover:text-gold"
              >
                {expanded ? copy.readLess : copy.readMore}
              </button>
            ) : null}
          </div>
        ) : null}

        {metaItems.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            {metaItems.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-1.5 text-[11px] text-muted"
              >
                <item.icon className="size-3.5 shrink-0 text-gold" aria-hidden />
                <span className="truncate">{item.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <Button
          type="button"
          variant={isSelected ? "gold" : "default"}
          className="mt-4 w-full"
          onClick={() => onSelect(pkg.id)}
        >
          {isSelected ? copy.selectedPackage : copy.selectPackage}
        </Button>
      </div>
    </article>
  );
}
