import { useParams } from "react-router-dom";
import { GalleryDetailView } from "@/features/photographer-gallery-detail";

export function PhotographerGalleryDetailPage() {
  const { id = "" } = useParams();

  return <GalleryDetailView galleryId={id} />;
}
