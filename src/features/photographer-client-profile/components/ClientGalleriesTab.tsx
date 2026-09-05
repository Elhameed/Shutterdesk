import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip } from "@/components/ui/tooltip";
import { CLIENT_PROFILE_COPY } from "@/constants/photographer-client-profile";
import { ROUTES } from "@/constants/routes";
import { resolveMediaUrl } from "@/lib/media-url";
import type { ClientGallery } from "@/types/domains/photographer-client";
import { cn } from "@/lib/utils";

type ClientGalleriesTabProps = {
  galleries: ClientGallery[];
};

export function ClientGalleriesTab({ galleries }: ClientGalleriesTabProps) {
  const copy = CLIENT_PROFILE_COPY;

  if (galleries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-soft">No galleries yet.</p>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-bold text-ink">
        {copy.deliveredGalleries}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {galleries.map((gallery) => (
          <article
            key={gallery.id}
            className="overflow-hidden rounded-md border border-border bg-panel"
          >
            <div className="h-36 sm:h-40">
              {gallery.coverImage ? (
                <img
                  src={resolveMediaUrl(gallery.coverImage, "")}
                  alt={gallery.title}
                  className="size-full object-cover grayscale"
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-paper-dim to-paper-dim" />
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-ink">
                  {gallery.title}
                </h4>
                <Tooltip label={copy.openGallery}>
                  <Link
                    to={ROUTES.photographer.galleryDetail(gallery.id)}
                    className="rounded p-0.5 text-ink-soft transition-colors hover:text-ink"
                    aria-label={copy.openGallery}
                  >
                    <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                </Tooltip>
              </div>
              <p className="mt-1 text-xs text-ink-soft">
                {copy.items(gallery.itemCount)} •{" "}
                <span
                  className={cn(
                    gallery.privacy === "public"
                      ? "text-ink"
                      : "text-ink-soft",
                  )}
                >
                  {copy.galleryPrivacy[gallery.privacy]}
                </span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
