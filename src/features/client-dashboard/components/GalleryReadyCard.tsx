import { Link } from "react-router-dom";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLIENT_DASHBOARD_COPY } from "@/constants/client-dashboard";
import { ROUTES } from "@/constants/routes";

type GalleryReadyCardProps = {
  title: string;
  photoCount: number;
  galleryId: string;
};

export function GalleryReadyCard({
  title,
  photoCount,
  galleryId,
}: GalleryReadyCardProps) {
  const copy = CLIENT_DASHBOARD_COPY;

  return (
    <section className="relative overflow-hidden rounded-xl bg-charcoal p-6 text-white shadow-card">
      <Sparkles
        className="pointer-events-none absolute -top-2 right-4 size-24 text-gold/30"
        aria-hidden
      />

      <p className="text-[11px] font-semibold tracking-wider text-gold uppercase">
        {copy.galleryReady}
      </p>
      <h2 className="mt-2 text-2xl font-bold">{title}</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
        <CheckCircle2 className="size-4 text-gold" aria-hidden />
        {copy.photosReady(photoCount)}
      </p>

      <Button variant="gold" size="sm" className="mt-5" asChild>
        <Link to={ROUTES.client.galleryDetail(galleryId)}>
          {copy.viewGallery}
        </Link>
      </Button>
    </section>
  );
}
