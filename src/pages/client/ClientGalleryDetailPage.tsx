import { useParams } from "react-router-dom";
import { ClientGalleryDetailView } from "@/features/client-gallery-detail";

export function ClientGalleryDetailPage() {
  const { id = "" } = useParams();
  return <ClientGalleryDetailView galleryId={id} />;
}
