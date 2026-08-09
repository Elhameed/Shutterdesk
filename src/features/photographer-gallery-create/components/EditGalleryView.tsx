import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { GalleryFormView } from "@/features/photographer-gallery-create/components/GalleryFormView";
import { photographerApi } from "@/services/photographer";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";
import { FormSkeleton } from "@/components/skeletons";
import {
  galleryDetailToFormValues,
  type GalleryFormValues,
} from "@/types/domains/gallery";

export function EditGalleryView() {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<GalleryFormValues | null>(
    null,
  );
  const [coverImage, setCoverImage] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const showSkeleton = useDelayedLoading(isLoading);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    void photographerApi.galleries.getDetail(id).then((detail) => {
      if (detail) {
        setInitialValues(galleryDetailToFormValues(detail));
        setCoverImage(detail.gallery.coverImage);
      }
      setIsLoading(false);
    });
  }, [id]);

  if (showSkeleton) {
    return <FormSkeleton fields={5} />;
  }

  if (isLoading) {
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
