import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { GalleryFormView } from "@/features/photographer-gallery-create/components/GalleryFormView";
import { usePhotographerGalleryDetail } from "@/hooks/queries/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { FormSkeleton } from "@/components/skeletons";
import {
  galleryDetailToFormValues,
} from "@/types/domains/gallery";

export function EditGalleryView() {
  const { id } = useParams<{ id: string }>();
  const { data: detail, isPending } = usePhotographerGalleryDetail(id);
  const showSkeleton = useDelayedLoading(isPending);

  // Seed values only. The form owns its state from here, so typing in a field
  // is not a cache write.
  const initialValues = detail ? galleryDetailToFormValues(detail) : null;
  const coverImage = detail?.gallery.coverImage;

  if (showSkeleton) {
    return <FormSkeleton fields={5} />;
  }

  if (isPending) {
    return null;
  }

  if (!id || !initialValues) {
    return <Navigate to={ROUTES.photographer.galleries} replace />;
  }

  return (
    <GalleryFormView
      mode="edit"
      galleryId={id}
      initialValues={initialValues}
      coverImage={coverImage}
    />
  );
}
