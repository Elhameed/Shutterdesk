export const BOOKING_PROGRESS_STEP = {
  BOOKING_REQUESTED: 0,
  PAYMENT_SUBMITTED: 1,
  PAYMENT_VERIFIED: 2,
  SESSION_SCHEDULED: 3,
  SESSION_COMPLETED: 4,
  GALLERY_UPLOADED: 5,
  GALLERY_DELIVERED: 6,
} as const;

export const GALLERY_PROGRESS_STEP = {
  NOT_STARTED: 0,
  EDITING: 1,
  READY: 2,
  DELIVERED: 3,
} as const;

type GalleryProgressSource = {
  workflowStatus: string;
  photoCount: number;
};

type BookingProgressSource = {
  progressStep: number;
  galleryStep: number;
};

export function resolveProgressFromGallery(
  gallery: GalleryProgressSource,
): { progressStep: number | null; galleryStep: number } {
  if (gallery.workflowStatus === "delivered") {
    return {
      progressStep: BOOKING_PROGRESS_STEP.GALLERY_DELIVERED,
      galleryStep: GALLERY_PROGRESS_STEP.DELIVERED,
    };
  }

  if (gallery.workflowStatus === "ready") {
    return {
      progressStep: BOOKING_PROGRESS_STEP.GALLERY_UPLOADED,
      galleryStep: GALLERY_PROGRESS_STEP.READY,
    };
  }

  if (gallery.photoCount > 0) {
    return {
      progressStep: BOOKING_PROGRESS_STEP.GALLERY_UPLOADED,
      galleryStep: GALLERY_PROGRESS_STEP.EDITING,
    };
  }

  return {
    progressStep: null,
    galleryStep: GALLERY_PROGRESS_STEP.EDITING,
  };
}

export function mergeBookingProgress(
  booking: BookingProgressSource,
  gallery?: GalleryProgressSource | null,
) {
  if (!gallery) {
    return {
      progressStep: booking.progressStep,
      galleryStep: booking.galleryStep,
    };
  }

  const resolved = resolveProgressFromGallery(gallery);

  return {
    progressStep:
      resolved.progressStep === null
        ? booking.progressStep
        : Math.max(booking.progressStep, resolved.progressStep),
    galleryStep: Math.max(booking.galleryStep, resolved.galleryStep),
  };
}

export function buildBookingProgressUpdate(
  booking: BookingProgressSource,
  gallery: GalleryProgressSource,
) {
  const merged = mergeBookingProgress(booking, gallery);

  return {
    progressStep: merged.progressStep,
    galleryStep: merged.galleryStep,
  };
}
